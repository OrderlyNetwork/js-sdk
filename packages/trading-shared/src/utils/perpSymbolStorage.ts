import { isBinarySymbol } from "@orderly.network/utils";

/** Storage key for the SDK-managed "last perp symbol" preference. */
export const PERP_SYMBOL_STORAGE_KEY = "orderly_perp_symbol";

/**
 * Reads the last perp symbol stored via `setStoredPerpSymbol`.
 *
 * Returns null when nothing valid is stored. Prediction round symbols (e.g.
 * PERP_BTC5M2608271200_USDC) are never returned: rounds expire, so a stored
 * round would hijack every symbol-less /perp redirect onto a dead market. A
 * stored round symbol is removed so the store self-heals.
 */
export function getStoredPerpSymbol(): string | null {
  const symbol = localStorage.getItem(PERP_SYMBOL_STORAGE_KEY);
  if (!symbol) return null;
  if (isBinarySymbol(symbol)) {
    localStorage.removeItem(PERP_SYMBOL_STORAGE_KEY);
    return null;
  }
  return symbol;
}

/**
 * Stores the perp symbol for symbol-less redirects. Prediction round symbols
 * and empty values are ignored: rounds expire and would strand the host on a
 * dead market.
 */
export function setStoredPerpSymbol(symbol: string): void {
  if (!symbol || isBinarySymbol(symbol)) return;
  localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, symbol);
}
