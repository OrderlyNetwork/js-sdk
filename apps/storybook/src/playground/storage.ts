import { isBinarySymbol } from "@orderly.network/utils";

export const DEFAULT_SYMBOL = "PERP_ETH_USDC";
export const ORDERLY_SYMBOL_KEY = "orderly-current-symbol";

export function getSymbol() {
  const symbol = localStorage.getItem(ORDERLY_SYMBOL_KEY) || DEFAULT_SYMBOL;
  // A prediction round contract stored before the updateSymbol guard is not a
  // perps market; fall back so symbol-less /perp redirects stay valid.
  return isBinarySymbol(symbol) ? DEFAULT_SYMBOL : symbol;
}

export function updateSymbol(symbol: string) {
  // Never persist a prediction round symbol (e.g. PERP_BTC5M2608271200_USDC)
  // as the perps symbol; it would hijack every symbol-less /perp redirect.
  if (isBinarySymbol(symbol)) return;
  localStorage.setItem(ORDERLY_SYMBOL_KEY, symbol || DEFAULT_SYMBOL);
}
