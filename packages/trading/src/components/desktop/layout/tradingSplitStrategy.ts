/**
 * Trading desktop layout strategy: uses layout-split splitStrategy with trading-specific
 * initial layout (createTradingDesktopLayout). Strategy is pluggable; this module wires
 * split as the default for desktop.
 */

export { splitStrategy } from "@orderly.network/layout-split";
export type { SplitLayoutModel } from "@orderly.network/layout-split";
export {
  createTradingDesktopLayout,
  type CreateTradingDesktopLayoutOptions,
} from "./tradingDesktopLayout";
