import {
  buyStock,
} from "../services/tradingApi";

export default function OrderTable({
  orders,
  handleCancel,
}) {

  // AUTO SORT BY LATEST TIME DESC
  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.order_timestamp) -
      new Date(a.order_timestamp)
  );

  // CALCULATE REPEAT PRICE
  const calculateBuyPrice = (
    currentPrice,
    currentPercentage = 16,
    targetPercentage = 17
  ) => {

    return (
      (
        Number(currentPrice) /
        (1 + currentPercentage / 100)
      ) *
      (1 + targetPercentage / 100)
    ).toFixed(2);

  };

  // REPEAT ORDER
  const handleRepeatOrder = async (
    symbol,
    currentPrice,
    qty
  ) => {

    try {

      const repeatPrice =
        calculateBuyPrice(currentPrice);

      await buyStock({
        symbol,
        qty,
        price: repeatPrice,
      });

      alert(
        `Repeat Order Created\n${symbol}\n₹${repeatPrice}`
      );

    } catch (error) {

      console.error(error);

      alert("Order Failed");

    }

  };

  return (

    <div className="overflow-auto rounded-2xl border border-slate-800">

      <table className="w-full text-sm">

        <thead className="bg-slate-800 text-slate-300 sticky top-0">

          <tr>

            <th className="p-4 text-left">
              Order ID
            </th>

            <th className="p-4 text-left">
              Symbol
            </th>

            <th className="p-4 text-left">
              Type
            </th>

            <th className="p-4 text-left">
              Status
            </th>

            <th className="p-4 text-left">
              Qty
            </th>

            <th className="p-4 text-left">
              Price
            </th>

            <th className="p-4 text-left">
              Time
            </th>

            <th className="p-4 text-left">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {sortedOrders.map((order) => {

            const buyPrice =
              calculateBuyPrice(
                order.price || 0
              );

            return (

              <tr
                key={order.order_id}
                className="border-t border-slate-800 hover:bg-slate-900"
              >

                <td className="p-4 text-white">
                  {order.order_id}
                </td>

                <td className="p-4 text-white font-semibold">
                  {order.tradingsymbol}
                </td>

                <td className="p-4 text-white">
                  {order.transaction_type}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold
                    ${
                      order.status === "COMPLETE"
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {order.status}
                  </span>

                </td>

                <td className="p-4 text-white">
                  {order.quantity}
                </td>

                <td className="p-4 text-green-400 font-bold">
                  ₹ {order.price}
                </td>

                <td className="p-4 text-slate-300 text-xs">
                  {order.order_timestamp}
                </td>

                <td className="p-4">

                  <div className="flex gap-2 flex-wrap">

                    {/* REPEAT ORDER */}
                    <button
                      onClick={() =>
                        handleRepeatOrder(
                          order.tradingsymbol,
                          order.price,
                          order.quantity
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-white font-semibold"
                    >
                      Repeat @ ₹{buyPrice}
                    </button>

                    {/* CANCEL */}
                    <button
                      onClick={() =>
                        handleCancel(
                          order.order_id
                        )
                      }
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
                    >
                      Cancel
                    </button>

                  </div>

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  );

}