export type Order = {
  id: string;
  symbol: string;
  user: string;
  platform: string;
  amount: number;
  percentage: number;
  status: "Executed" | "Cancelled";
};