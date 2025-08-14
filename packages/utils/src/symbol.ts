/**
 * Format trading pair symbol *
 * Format symbols like "PERP_BTC_USDT" according to the specified format
 *
 * @param symbol - Original trading pair symbol in format "type_base_quote" (e.g., "PERP_BTC_USDT")
 * @param formatString - Format string template, defaults to "base"
 *                    - Supports the following placeholders:
 *                    - "type": Trading type (e.g., "PERP")
 *                    - "base": Base currency (e.g., "BTC")
 *                    - "quote": Quote currency (e.g., "USDT")
 *
 * @returns Formatted string, returns empty string if input is empty
 *
 * @example
 * ```typescript
 * formatSymbol("PERP_BTC_USDT")                    // "BTC"
 * formatSymbol("PERP_BTC_USDT", "base")            // "BTC"
 * formatSymbol("PERP_BTC_USDT", "base-type")      // "BTC-PERP"
 * formatSymbol("SPOT_ETH_USDC", "base-quote")      // "ETH-USDC"
 * ```
 */
export function formatSymbol(
  symbol: string,
  formatString: string = "base-type",
) {
  if (!symbol) {
    return "";
  }

  // Split symbol by "_" to get each component
  const arr = symbol.split("_");
  const type = arr[0]; // Trading type (e.g., PERP, SPOT)
  const base = arr[1]; // Base currency (e.g., BTC, ETH)
  const quote = arr[2]; // Quote currency (e.g., USDT, USDC)

  // Use template string to replace placeholders and return formatted result
  return formatString
    .replace("type", type)
    .replace("base", base)
    .replace("quote", quote);
}
