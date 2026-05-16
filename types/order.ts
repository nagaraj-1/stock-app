export type OrderStatus = "Executed" | "Cancelled";

export type Order = {
  id: string;
  symbol: string;
  user: string;
  platform: string;
  amount: number;
  qty: number;
  price: number;
  finalPrice: number;
  percentage: number;
  status: OrderStatus;
  date: string;
  time: string;
};