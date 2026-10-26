import { API } from "@orderly.network/types";
import type { SymbolsInfo } from "../../orderly/useSymbolsInfo";

/** Resolve the getter proxy before passing config to the shared calculators. */
export function resolveSymbolsInfo(
  rows: ReadonlyArray<Pick<API.Position, "symbol">>,
  symbolsInfo?: SymbolsInfo,
): Record<string, API.SymbolExt> | undefined {
  if (!symbolsInfo || symbolsInfo.isNil) return undefined;
  const resolved: Record<string, API.SymbolExt> = {};
  for (const row of rows) {
    const info = symbolsInfo[row.symbol]?.();
    if (info) resolved[row.symbol] = info;
  }
  return resolved;
}
