export const DEFAULT_SYMBOL = "PERP_ETH_USDC";
export const ORDERLY_SYMBOL_KEY = "orderly-current-symbol";

export function getSymbol() {
  return localStorage.getItem(ORDERLY_SYMBOL_KEY) || DEFAULT_SYMBOL;
}

export function updateSymbol(symbol: string) {
  localStorage.setItem(ORDERLY_SYMBOL_KEY, symbol || DEFAULT_SYMBOL);
}
