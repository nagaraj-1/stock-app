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
      const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        stock.stock
      )}`;

     

      const result = await yahooUrl.json();

      

      const yahooSymbol =
        result.quotes?.[0]?.symbol ||
        stock.stock;

      setSymbol(yahooSymbol.replace(".NS", ""));

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

  const aiModeOrderTrack = async (
    user1,
    orderId
  ) => {
    try {
      console.log("AI MODE TRACK:", {
        user1,
        orderId,
      });

      const url = API_CONFIG[user1];

      const response = await fetch(
        `${url}/live-track?order_id=${orderId}&sell_price=1500`,
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
        `${url}stop-track?order_id=${orderId}`,
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
      console.log(user);

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
        await fetchOrders();
      }
    } catch (error) {
      console.error(
        "BUY API ERROR:",
        error
      );
    }
  };

  const sellOrder = async (order,sellPrice) => {
    try {

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

      // MANUAL EDITS
      setManualTargetPrice,
      setManualTargetQty,
    },

    orders,
    showSettings,
    isLoadingStock,
  };
}