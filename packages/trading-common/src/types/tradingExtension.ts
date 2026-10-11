import type { ReactNode } from "react";
import type {
  DropDownMarketsExtensionProps,
  ExpandMarketsExtensionProps,
  MarketsSheetExtensionProps,
} from "@orderly.network/markets-core";
import type { API } from "@orderly.network/types";
import type { SharePnLConfig } from "@orderly.network/ui-share";

export type TradingMarketsDropdownProps = DropDownMarketsExtensionProps;
export type TradingMarketsSheetProps = MarketsSheetExtensionProps;
export type TradingSideMarketsProps = ExpandMarketsExtensionProps;

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

/** Optional product content for desktop and mobile account tabs. */
export type TradingDataListProductContent = Partial<{
  positions: ReactNode | ((perpsContent: ReactNode) => ReactNode);
  pending: ReactNode;
  filled: ReactNode;
  positionHistory: ReactNode;
  orderHistory: ReactNode;
  counts: { positions?: number; pending?: number | null };
  mobile: Partial<{
    positions: ReactNode | ((perpsContent: ReactNode) => ReactNode);
    pending: ReactNode;
    history: ReactNode;
  }>;
}>;

/** Extension slots independent of the trading page's layout and chart props. */
export type TradingPageExtensionProps = {
  marketsDropdown?: TradingMarketsDropdownProps;
  /** Mobile markets sheet (host supplies onRequestClose to close the sheet). */
  marketsSheet?: TradingMarketsSheetProps;
  /** Desktop side markets panel (expanded mode). */
  sideMarkets?: TradingSideMarketsProps;
  dataListProductContent?: TradingDataListProductContent;
};
