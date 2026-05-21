import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_INVESTMENTS,
  DEFAULT_ORDER,
  STORAGE_KEYS,
} from "../constants/trading";

export function useTradingOrders() {
  const [showSettings, setShowSettings] =
    useState(false);

  const [isLoadingStock, setIsLoadingStock] =
    useState(false);

  // SETTINGS
  const [sInvestment, setSInvestment] =
    useState(
      localStorage.getItem(
        STORAGE_KEYS.sInvestment
      ) || DEFAULT_INVESTMENTS.sInvestment
    );

  const [nInvestment, setNInvestment] =
    useState(
      localStorage.getItem(
        STORAGE_KEYS.nInvestment
      ) || DEFAULT_INVESTMENTS.nInvestment
    );

  // ORDER FORM
  const [symbol, setSymbol] = useState(
    DEFAULT_ORDER.symbol
  );

  const [price, setPrice] = useState(
    DEFAULT_ORDER.price
  );

  const [topPercent, setTopPercent] =
    useState(DEFAULT_ORDER.topPercent);

  const [user, setUser] = useState(
    DEFAULT_ORDER.user
  );

  const [targetPercent, setTargetPercent] =
    useState(DEFAULT_ORDER.targetPercent);

  // ORDERS
  const [orders, setOrders] = useState([]);

  // MANUAL INPUTS
  const [manualTargetPrice, setManualTargetPrice] =
    useState("");

  const [manualTargetQty, setManualTargetQty] =
    useState("");

  // AUTO TARGET PRICE
  const calculatedTargetPrice = useMemo(() => {
    return (
      Math.round(
        ((price / (1 + topPercent / 100)) *
          (1 + targetPercent / 100)) *
          100
      ) / 100
    );
  }, [price, topPercent, targetPercent]);

  // FINAL TARGET PRICE
  const targetPrice =
    manualTargetPrice !== ""
      ? Number(manualTargetPrice)
      : calculatedTargetPrice;

  // AUTO TARGET QTY
  const calculatedTargetQty = useMemo(() => {
    const investment =
      user === "S"
        ? Number(sInvestment)
        : Number(nInvestment);

    const qty = Math.floor(
      investment / (targetPrice / 5)
    );

    return qty || 0;
  }, [
    user,
    targetPrice,
    sInvestment,
    nInvestment,
  ]);

  // FINAL TARGET QTY
  const targetQty =
    manualTargetQty !== ""
      ? Number(manualTargetQty)
      : calculatedTargetQty;

  // SAVE SETTINGS
  const saveSettings = () => {
    localStorage.setItem(
      STORAGE_KEYS.sInvestment,
      sInvestment
    );

    localStorage.setItem(
      STORAGE_KEYS.nInvestment,
      nInvestment
    );

    setShowSettings(false);
  };

  // SELECT STOCK
  const selectStock = async (stock) => {
    setIsLoadingStock(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/symbol?stockname=${encodeURIComponent(
          stock.stock
        )}`
      );

      const result = await response.json();

      console.log("SYMBOL API:", result);

      setSymbol(result.output || stock.stock);

      setPrice(
        Number(stock.currentPrice) || 0
      );

      setTopPercent(
        Number(stock.percentage) || 0
      );

      // RESET MANUAL VALUES
      setManualTargetPrice("");
      setManualTargetQty("");
    } catch (error) {
      console.error(
        "Error fetching stock symbol:",
        error
      );
    } finally {
      setIsLoadingStock(false);
    }
  };

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      // NAG
      const nagRes = await fetch(
        "http://127.0.0.1:8000/orders"
      );

      const nagJson = await nagRes.json();

      // CUTIE
      const cutieRes = await fetch(
        "http://127.0.0.1:8000/orders"
      );

      const cutieJson = await cutieRes.json();

      // MAP DATA
      const nagOrders = nagJson.orders.map(
        (item) => ({
          ...item,
          tableUser: "NAG",
        })
      );

      const cutieOrders =
        cutieJson.orders.map((item) => ({
          ...item,
          tableUser: "CUTIE",
        }));

      // MERGE + SORT
      const merged = [
        ...nagOrders,
        ...cutieOrders,
      ].sort(
        (a, b) =>
          new Date(b.order_timestamp) -
          new Date(a.order_timestamp)
      );

      console.log("MERGED:", merged);

      setOrders(merged);
    } catch (error) {
      console.log(
        "Error fetching orders:",
        error
      );
    }
  };

  // LOAD ON START
  useEffect(() => {
    fetchOrders();
  }, []);


  const aiModeOrderTrack = async (user1, orderId) => {
  try {
    let url = "";

    if (user1 === "NAG") {
      url = "http://127.0.0.1:8000";
    } else {
      url = "http://stock1.eatoo.in";
    }

    const response = await fetch(
      `${url}/live-track?order_id=${orderId}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    console.log("CANCEL RESPONSE:", data);

    // refresh orders
    await fetchOrders();

  } catch (error) {
    console.log("Cancel order error:", error);
  }
};

const calcelOrders = async (user1, orderId) => {
  try {
    let url = "";

    if (user1 === "NAG") {
      url = "http://127.0.0.1:8000";
    } else {
      url = "http://stock1.eatoo.in";
    }

    const response = await fetch(
      `${url}/cancel-order?order_id=${orderId}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    console.log("CANCEL RESPONSE:", data);

    // refresh orders
    await fetchOrders();

  } catch (error) {
    console.log("Cancel order error:", error);
  }
};




  // EXECUTE ORDER
  const executeOrder = async () => {
    try {

      let url = ""
      if(user === "NAG") 
        url = "http://127.0.0.1:8000"
        else 
        url = "http://stock1.eatoo.in"

      


      const response = await fetch(
        `${url}/buy?symbol=${symbol}&qty=${targetQty}&trigger_price=${targetPrice}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("BUY RESPONSE:", data);

      // AUTO REFRESH ORDERS
      if (data.success) {
        await fetchOrders();
      }
    } catch (error) {
      console.error(
        "BUY API ERROR:",
        error
      );
    }
  };

  const sellOrder = async (order) => {
    try {
console.log("SELL ORDER:", order);

    const sellPercent = 16.7;


    const sellPrice = Number(
      (
        (order.trigger_price / (1 + (15.55 / 100))) *
        (1 + (sellPercent / 100))
      ).toFixed(2)
    );

    console.log({
      symbol: order.tradingsymbol,
      user: order.tableUser,
      qty: order.quantity,
      sellPrice,
    });

      let url = ""
      if(order.tableUser === "NAG") 
        url = "http://127.0.0.1:8000"
        else 
        url = "http://stock1.eatoo.in"

      


      const response = await fetch(
        `${url}/sell?symbol=${order.tradingsymbol}&qty=${order.quantity}&price=${sellPrice}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("SELL RESPONSE:", data);

      // AUTO REFRESH ORDERS
      if (data.success) {
        await fetchOrders();
      }
    } catch (error) {
      console.error(
        "BUY API ERROR:",
        error
      );
    }
  };

  return {
    fields: {
      symbol,
      price,
      topPercent,
      user,
      targetPercent,
      targetPrice,
      targetQty,
      sInvestment,
      nInvestment,
      manualTargetPrice,
      manualTargetQty,
    },

    actions: {
      setSymbol,
      setPrice,
      setTopPercent,
      setUser,
      setTargetPercent,
      setSInvestment,
      setNInvestment,
      setShowSettings,
      saveSettings,
      selectStock,
      executeOrder,
      fetchOrders,
calcelOrders,
      aiModeOrderTrack,
      sellOrder,
      // MANUAL EDITS
      setManualTargetPrice,
      setManualTargetQty,
    },

    orders,
    showSettings,
    isLoadingStock,
  };
}