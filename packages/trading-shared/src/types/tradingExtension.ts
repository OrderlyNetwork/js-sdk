import type { API } from "@orderly.network/types";
import type { SharePnLConfig } from "@orderly.network/ui-share";

/** Host-owned behavior and presentation for shared Perps panels. */
export type TradingPerpsPanelProps = {
  /**
   * Controlled Perps symbol selection. When provided, TradingPage calls it
   * instead of routing to `/perp/<symbol>` through `onRouteChange`; the host
   * then owns updating its symbol state and URL.
   */
  onSymbolChange?: (symbol: API.Symbol) => void;
  sharePnLConfig?: SharePnLConfig;
  pnlNotionalDecimalPrecision?: number;
};
