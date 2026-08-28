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
    useState(
      localStorage.getItem(
        STORAGE_KEYS.targetPercentage
      ) || DEFAULT_ORDER.targetPercent
    );

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
      investment / ((targetPrice + (targetPrice * 0.003)) / 5)
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
  const saveSettings = async () => {
    try {
      const params = new URLSearchParams({
        nInvestment,
        cInvestment,
        targetPercentage: targetPercent,
      });

      const response = await fetch(
        `${API_CONFIG.NAG}/save-investment?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      console.log(result);

      localStorage.setItem(
        STORAGE_KEYS.nInvestment,
        nInvestment
      );

      localStorage.setItem(
        STORAGE_KEYS.cInvestment,
        cInvestment
      );

      localStorage.setItem(
        STORAGE_KEYS.targetPercentage,
        targetPercent
      );

      setShowSettings(false);

    } catch (err) {
      console.error(err);
    }
  };

  // SELECT STOCK
  const selectStock = async (stock) => {
    setIsLoadingStock(true);

    try {

      setSymbol(stock.stock)
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

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      document.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);


  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      // NAG
      const nagRes = await fetch(
        `${API_CONFIG.NAG}/orders`
      );

      const nagJson = await nagRes.json();

      // CUTIE
      let cutieJson = [];


try {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 500); // 5 seconds

  const cutieRes = await fetch(
    `${API_CONFIG.CUTIE}/orders`,
    {
      signal: controller.signal,
    }
  );

  clearTimeout(timeoutId);

  if (cutieRes.ok) {
    cutieJson = await cutieRes.json();
  }
} catch (error) {
  // Network error / timeout / CUTIE unavailable
  console.warn("CUTIE unavailable after 5 seconds — skipping");
}

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
      ].sort((a, b) => {
        const aStatus = a.status?.toUpperCase();
        const bStatus = b.status?.toUpperCase();

        const aPending =
          aStatus === "TRIGGER PENDING";

        const bPending =
          bStatus === "TRIGGER PENDING";

        const aOpen =
          aStatus === "OPEN";

        const bOpen =
          bStatus === "OPEN";

        // 1. TRIGGER PENDING first
        if (aPending && !bPending) return -1;
        if (!aPending && bPending) return 1;

        // 2. OPEN second
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;

        // 3. Same priority → latest date first
        return (
          new Date(b.order_timestamp) -
          new Date(a.order_timestamp)
        );
      });

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



  // LOAD ON START
  useEffect(() => {
    fetchOrders();
    loadInvestmentSettings();
  }, []);

  const loadInvestmentSettings = async () => {
    try {
      const nagRes = await fetch(
        `${API_CONFIG.NAG}/load-investment`
      );

      const nagJson = await nagRes.json();

      localStorage.setItem(
        STORAGE_KEYS.nInvestment,
        nagJson["N-I"]
      );

      localStorage.setItem(
        STORAGE_KEYS.cInvestment,
        nagJson["C-I"]
      );
      const loadedTargetPercentage =
        nagJson["T-PERCENTAGE"] ?? DEFAULT_ORDER.targetPercent;

      if (loadedTargetPercentage != null) {
        setTargetPercent(loadedTargetPercentage);
        localStorage.setItem(
          STORAGE_KEYS.targetPercentage,
          loadedTargetPercentage
        );
      }
      setIsCutieAiActive(nagJson["C-Mode"] === "ON");
      setIsNagAiActive(nagJson["N-Mode"] === "ON");
    } catch (error) {
      console.error("Failed to load investment settings:", error);
    }
  };

  const setIsNagAiActiveMode = (isActive) => {
    setIsNagAiActive(isActive);
    const url = API_CONFIG["NAG"];
    fetch(
      `${url}/ai-mode-enable?user=N&mode=${isActive ? "ON" : "OFF"}`,
      {
        method: "POST",
      }
    );
  }

  const setIsCutieAiActiveMode = (isActive) => {
    setIsCutieAiActive(isActive);
    const url = API_CONFIG["NAG"];
    fetch(
      `${url}/ai-mode-enable?user=C&mode=${isActive ? "ON" : "OFF"}`,
      {
        method: "POST",
      }
    );
  }


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
    const url = API_CONFIG[user];

    try {
      setIsLoadingStock(true);

      // ==========================================
      // 1. FIND PREVIOUS PENDING ORDER
      // ==========================================
      const previousOrder = orders.find(
        (order) =>
          order.tableUser === user &&
          order.status?.toUpperCase() === "TRIGGER PENDING"
      );

      // ==========================================
      // 2. CANCEL PREVIOUS ORDER
      // ==========================================
      if (previousOrder) {
        console.log(
          "Cancelling previous order:",
          previousOrder.order_id
        );

        const cancelUrl = API_CONFIG[previousOrder.tableUser];

        const cancelResponse = await fetch(
          `${cancelUrl}/cancel-order?order_id=${previousOrder.order_id}`,
          {
            method: "POST",
          }
        );

        const cancelData = await cancelResponse.json();

        console.log("CANCEL RESPONSE:", cancelData);

        // If cancel failed, don't place new order
        if (!cancelResponse.ok || cancelData.success === false) {
          console.error("Previous order cancellation failed");
          return;
        }
      }

      // ==========================================
      // 3. PLACE NEW BUY ORDER
      // ==========================================
      console.log("Placing new order:", {
        user,
        symbol,
        qty: targetQty,
        trigger_price: targetPrice,
      });

      const response = await fetch(
        `${url}/buy?symbol=${symbol}&qty=${targetQty}&trigger_price=${targetPrice}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("BUY RESPONSE:", data);

      // ==========================================
      // 4. REFRESH ORDERS
      // ==========================================
      if (data.success) {
        await fetchOrders();
      }

    } catch (error) {
      console.error("BUY API ERROR:", error);
    } finally {
      setIsLoadingStock(false);
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
      setIsNagAiActiveMode,
      setIsCutieAiActiveMode,
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
