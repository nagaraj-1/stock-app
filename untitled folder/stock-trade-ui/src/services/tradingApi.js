import axios from "axios";
import { API_CONFIG } from "../config/api";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const buyStock = async (data) => {
  // sanitize price and qty
  const price = Number(String(data.price).replace(/[^0-9.-]+/g, ''));
  const qty = Number(data.qty);
  if (!data.symbol || !qty || !price) {
    throw new Error('Invalid buy parameters');
  }

  const response = await api.post('/buy', null, {
    params: {
      symbol: data.symbol,
      qty,
      trigger_price: price,
    },
  });
  return response.data;
};

export const sellStock = async (data) => {
  const price = Number(String(data.price).replace(/[^0-9.-]+/g, ''));
  const qty = Number(data.qty);
  if (!data.symbol || !qty || !price) {
    throw new Error('Invalid sell parameters');
  }

  const response = await api.post('/sell', null, {
    params: {
      symbol: data.symbol,
      qty,
      price,
    },
  });
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.post(`/cancel-order?order_id=${orderId}`);
  return response.data;
};