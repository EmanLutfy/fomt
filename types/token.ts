export interface Token {
  symbol: string;
  name: string;
  address: string;
  price: number;
  marketCap: number;
  chain: "Robinhood Chain";
}

export interface TokenStats {
  trackedWalletsActive: number;
  buys: number;
  sells: number;
  trackedBuyVolumeUsd: number;
  trackedSellVolumeUsd: number;
}
