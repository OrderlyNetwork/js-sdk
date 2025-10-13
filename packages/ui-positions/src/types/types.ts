import { PriceMode } from "@kodiak-finance/orderly-hooks";
import { API } from "@kodiak-finance/orderly-types";
import { SortOrder } from "@kodiak-finance/orderly-ui";
import { SharePnLConfig } from "@kodiak-finance/orderly-ui-share";

export type SortType = {
  sortKey: string;
  sortOrder: SortOrder;
};

export type PositionsProps = {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig;
  symbol?: string;
  calcMode?: PriceMode;
  includedPendingOrder?: boolean;
  selectedAccount?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  enableSortingStorage?: boolean; // Controls whether to persist sorting preferences
};
