export type TradeSide = "BUY" | "SELL";

export interface Trade {
  id: string;
  timestamp: string;
  side: TradeSide;
  token: string;
  tokenAddress: string;
  sizeUsd: number;
  price: number;
  marketCap: number;
  traderHandle: string;
  traderAddress: string;
  txHash: string;
}

export interface TradeFilters {
  side?: "ALL" | TradeSide;
  minSizeUsd?: number;
  maxSizeUsd?: number;
  sinceMinutes?: number;
  query?: string;
}
