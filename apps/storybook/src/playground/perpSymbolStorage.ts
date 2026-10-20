import {
  getStoredPerpSymbol,
  setStoredPerpSymbol,
} from "@orderly.network/trading-shared";

export const DEFAULT_SYMBOL = "PERP_ETH_USDC";

export function getPerpSymbol() {
  return getStoredPerpSymbol() ?? DEFAULT_SYMBOL;
}

export function setPerpSymbol(symbol: string) {
  setStoredPerpSymbol(symbol);
}
