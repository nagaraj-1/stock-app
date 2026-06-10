import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_INVESTMENTS,
  DEFAULT_ORDER,
  STORAGE_KEYS,
} from "../constants/trading";

import API_CONFIG from "../config/apiConfig";

export function useTradingOrders() {
  const [showSettings, setShowSettings] =
    useState(false);

  const [isLoadingStock, setIsLoadingStock] =
    useState(false);

  const [pendingPopup, setPendingPopup] = useState(null);

  // SETTINGS
  const [cInvestment, setCInvestment] =
    useState(
      localStorage.getItem(
        STORAGE_KEYS.cInvestment
      ) || DEFAULT_INVESTMENTS.cInvestment
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

  const [isNagAiActive, setIsNagAiActive] =
    useState(false);

  const [isCutieAiActive, setIsCutieAiActive] =
    useState(false);

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
      user === "CUTIE"
        ? Number(cInvestment)
        : Number(nInvestment);

    const qty = Math.floor(
      investment / (targetPrice / 5)
    );

    return qty || 0;
  }, [
    user,
    targetPrice,
    cInvestment,
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
      STORAGE_KEYS.cInvestment,
      cInvestment
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
        `${API_CONFIG.NAG}/symbol-search?q=${stock.stock}`
      );

      const data = await response.json();



      if (data.data.length > 0)
        setSymbol(data.data[0].symbol);
      else
        setSymbol("")
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
        `${API_CONFIG.NAG}/orders`
      );

      const nagJson = await nagRes.json();

      // CUTIE
      const cutieRes = await fetch(
        `${API_CONFIG.CUTIE}/orders`
      );

      const cutieJson = await cutieRes.json();

      const nagOrders = Array.isArray(
        nagJson.orders
      )
        ? nagJson.orders.map((item) => ({
          ...item,
          tableUser: "NAG",
        }))
        : [];

      const cutieOrders = Array.isArray(
        cutieJson.orders
      )
        ? cutieJson.orders.map((item) => ({
          ...item,
          tableUser: "CUTIE",
        }))
        : [];

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
      return merged;
    } catch (error) {
      console.log(
        "Error fetching orders:",
        error
      );
    }
  };

  const handlePendingOrderPopup = (stockSymbol, pendingOrder) => {
    return new Promise((resolve) => {
      let handled = false;

      // AUTO ACTION AFTER 10 SEC
      const timer = setTimeout(async () => {
        if (handled) return;
        handled = true;

        console.log("No response -> Auto cancel order");

        await calcelOrders(
          pendingOrder.tableUser,
          pendingOrder.order_id
        );

        setPendingPopup(null);

        resolve("continue");
      }, 10000);

      setPendingPopup({
        stockSymbol,

        onSkip: () => {
          if (handled) return;
          handled = true;

          clearTimeout(timer);

          setPendingPopup(null);

          if (pendingOrder.tableUser === "NAG")
            setIsNagAiActive(false);
          else
            setIsCutieAiActive(false);


          resolve("skip");
        },

        onContinue: async () => {
          if (handled) return;
          handled = true;

          clearTimeout(timer);

          await calcelOrders(
            pendingOrder.tableUser,
            pendingOrder.order_id
          );

          setPendingPopup(null);

          resolve("continue");
        },
      });
    });
  };

  // LOAD ON START
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let interval;

    if (isNagAiActive || isCutieAiActive) {

      const runAiLogic = async () => {
        try {

          const aiUser = isNagAiActive ? "NAG" : "CUTIE";

          console.log("Running AI Logic...");

          const res = await fetch(`${API_CONFIG.NAG}/stocks`);
          let scannerData = await res.json();
          console.log("scannerDatascannerDatascannerData ", scannerData)
          scannerData = scannerData = scannerData?.data[0]?.data.sort(
            (b, a) => Number(a.percentage) - Number(b.percentage)
          );
          console.log("SCANNER DATA:", scannerData);
          if (!scannerData) return;

          const orderList = await fetchOrders();

          let hasTriggeredOrder = false;

          for (const stock of scannerData) {



            if (Number(stock.percentage) > 14.5 && Number(stock.percentage) < 15.30) {
              if (hasTriggeredOrder) break;
              hasTriggeredOrder = true;

              console.log(`Evaluating ${stock}: ${stock.percentage}%`);

              const response = await fetch(
                `${API_CONFIG.NAG}/symbol-search?q=${stock.stock}`
              );

              const data = await response.json();
              let stockSymbol
              if (data.data.length > 0)
                stockSymbol = data.data[0].symbol;

              const isExecuted = orderList.some(
                (o) => o.tableUser === aiUser && o.tradingsymbol === stockSymbol
                  && o.status?.toUpperCase() === "COMPLETE"
              );


              const sellOrderCheck = orderList.find(
                (o) => o.tableUser === aiUser && o.transaction_type == "SELL" && o.status?.toUpperCase() === "TRIGGER PENDING"
              );
              
              if (sellOrderCheck)
                continue;




              if (!isExecuted) {
                const pendingOrder = orderList.find(
                  (o) => o.tableUser === aiUser && o.status?.toUpperCase() === "TRIGGER PENDING"
                );
                console.log("PENDING ORDER:", pendingOrder);
                if (pendingOrder) {

                  if (pendingOrder.tradingsymbol === stockSymbol) {
                    console.log("SAME pending order exists, skipping popup.");
                    continue;
                  }

                  const action = await handlePendingOrderPopup(
                    stockSymbol,
                    pendingOrder
                  );

                  if (action === "skip") {
                    if (aiUser === "NAG")
                      setIsNagAiActive(false);
                    else
                      setIsCutieAiActive(false);
                    return;
                  }
                }

                const sPrice = Number(stock.currentPrice) || 0;
                const sPercent = Number(stock.percentage) || 0;
                const calcTargetPrice = Math.round(((sPrice / (1 + sPercent / 100)) * (1 + targetPercent / 100)) * 100) / 100;

                const buyPercentage = targetPercent;
                const sellPercentage = 16.5;
                const sellPrice = (
                  (price / (1 + buyPercentage / 100)) *
                  (1 + sellPercentage / 100)
                ).toFixed(2);

                console.log(calcTargetPrice);
                const investment = aiUser === "CUTIE" ? Number(cInvestment) : Number(nInvestment);
                const calcQty = Math.floor(investment / (calcTargetPrice / 5)) || 0;

                // Place new order
                const buyUrl = API_CONFIG[aiUser];
                const response = await fetch(
                  `${buyUrl}/buy?symbol=${stockSymbol}&qty=${calcQty}&trigger_price=${calcTargetPrice}`,
                  {
                    method: "POST",
                  }
                );

                const data = await response.json();

                console.log("BUY RESPONSE:", data);
                await fetchOrders();
                aiModeOrderTrack(aiUser, data.order_id, calcTargetPrice);
              }
            }
          }
        } catch (error) {
          console.error("AI Mode Error:", error);
        }
      };

      interval = setInterval(runAiLogic, 20000);
    }
    return () => clearInterval(interval);
  }, [isNagAiActive, isCutieAiActive, targetPercent, user, cInvestment, nInvestment]);

  const aiModeOrderTrack = async (
    user1,
    orderId, sell_price
  ) => {
    try {
      console.log("AI MODE TRACK:", {
        user1,
        orderId,
      });

      const url = API_CONFIG[user1];

      const response = await fetch(
        `${url}/live-track?order_id=${orderId}&sell_price=${sell_price}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      console.log("TRACK RESPONSE:", data);

      // refresh orders
      await fetchOrders();
    } catch (error) {
      console.log(
        "Track order error:",
        error
      );
    }
  };

  // ==========================================
  // STOP TRACK
  // ==========================================

  const stopTracking = async (user1, orderId) => {
    const url = API_CONFIG[user1];
    try {

      await fetch(
        `${url}/stop-track?order_id=${orderId}`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.log(error);
    }
  };


  const calcelOrders = async (
    user1,
    orderId
  ) => {
    try {
      const url = API_CONFIG[user1];

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
      console.log(
        "Cancel order error:",
        error
      );
    }
  };

  // EXECUTE ORDER
  const executeOrder = async () => {
    try {
      setIsLoadingStock(true);

      const url = API_CONFIG[user];

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
        setIsLoadingStock(false);

        await fetchOrders();
      }
    } catch (error) {
      console.error(
        "BUY API ERROR:",
        error
      );
    }
  };

  const sellOrder = async (order, sellPrice) => {
    try {
      setIsLoadingStock(true);
      console.log({
        symbol: order.tradingsymbol,
        user: order.tableUser,
        qty: order.quantity,
        sellPrice,
      });

      const url =
        API_CONFIG[order.tableUser];

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
        setIsLoadingStock(false);
        await fetchOrders();
      }
    } catch (error) {
      console.error(
        "SELL API ERROR:",
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
      cInvestment,
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
      setCInvestment,
      setNInvestment,
      setShowSettings,
      saveSettings,
      selectStock,
      executeOrder,
      fetchOrders,
      calcelOrders,
      aiModeOrderTrack,
      stopTracking,
      sellOrder,
      setIsNagAiActive,
      setIsCutieAiActive,
      // MANUAL EDITS
      setManualTargetPrice,
      setManualTargetQty,
    },

    orders,
    showSettings,
    isLoadingStock,
    isNagAiActive,
    isCutieAiActive,
    pendingPopup
  };
}