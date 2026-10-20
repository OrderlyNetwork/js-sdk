import { isBinarySymbol } from "./symbol";

/** Storage key for the SDK-managed "last perp symbol" preference. */
export const PERP_SYMBOL_STORAGE_KEY = "orderly_perp_symbol";

/**
 * Storage is unavailable during SSR, and reading or writing it can throw when
 * the browser blocks site data (e.g. some private modes or sandboxed iframes).
 */
function getStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

/**
 * Reads the last perp symbol stored via `setStoredPerpSymbol`.
 *
 * Returns null when nothing valid is stored or storage is unavailable.
 * Prediction round symbols (e.g. PERP_BTC5M2608271200_USDC) are never
 * returned: rounds expire, so a stored round would hijack every symbol-less
 * /perp redirect onto a dead market. A stored round symbol is removed so the
 * store self-heals.
 */
export function getStoredPerpSymbol(): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const symbol = storage.getItem(PERP_SYMBOL_STORAGE_KEY);
    if (!symbol) return null;
    if (isBinarySymbol(symbol)) {
      storage.removeItem(PERP_SYMBOL_STORAGE_KEY);
      return null;
    }
    return symbol;
  } catch {
    return null;
  }
}

/**
 * Stores the perp symbol for symbol-less redirects. Prediction round symbols
 * and empty values are ignored: rounds expire and would strand the host on a
 * dead market. Does nothing when storage is unavailable.
 */
export function setStoredPerpSymbol(symbol: string): void {
  if (!symbol || isBinarySymbol(symbol)) return;
  try {
    getStorage()?.setItem(PERP_SYMBOL_STORAGE_KEY, symbol);
  } catch {
    // Storage is full or blocked; the preference is best-effort.
  }
}
