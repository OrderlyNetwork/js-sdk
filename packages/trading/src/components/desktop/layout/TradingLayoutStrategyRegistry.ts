/**
 * Trading desktop layout strategy registry.
 * Central list of available strategies so layout can be switched (e.g. split vs grid)
 * and future user preference or custom strategies can be plugged in.
 */
import type { LayoutStrategy } from "@orderly.network/layout-core";
import { resolveStrategy } from "@orderly.network/layout-core";
import { splitStrategy } from "./tradingSplitStrategy";

/** Strategies available for the trading desktop layout */
export const TRADING_LAYOUT_STRATEGIES: LayoutStrategy[] = [splitStrategy];

/** Default strategy ID when no preference is set */
export const DEFAULT_TRADING_LAYOUT_STRATEGY_ID = splitStrategy.id;

/**
 * Resolve the layout strategy to use for the trading desktop.
 * Use when supporting strategy preference (e.g. from settings or localStorage).
 *
 * @param preferredId - Optional preferred strategy ID (e.g. "split" or "grid")
 * @returns Resolved strategy and its ID
 */
export function resolveTradingLayoutStrategy(preferredId?: string): {
  strategy: LayoutStrategy;
  id: string;
} {
  return resolveStrategy({
    preferredId,
    availableStrategies: TRADING_LAYOUT_STRATEGIES,
    defaultStrategy: splitStrategy,
  });
}
