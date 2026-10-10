import type { ReactNode } from "react";
import type { DropDownMarketsExtensionProps } from "@orderly.network/markets";
import type { API } from "@orderly.network/types";
import type { SharePnLConfig } from "@orderly.network/ui-share";

export type TradingMarketsDropdownProps = DropDownMarketsExtensionProps;

/** Host-owned behavior and presentation for shared Perps panels. */
export type TradingPerpsPanelProps = {
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
  dataListProductContent?: TradingDataListProductContent;
};
