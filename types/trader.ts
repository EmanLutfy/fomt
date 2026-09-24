export interface Trader {
  handle: string;
  address: string;
  fills: number;
  volumeUsd: number;
  tracked: true;
}

export interface Holding {
  token: string;
  tokenAddress: string;
  amount: number;
  price: number;
  valueUsd: number;
}
