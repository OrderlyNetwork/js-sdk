import { PriceMode } from "@veltodefi/hooks";
import { API } from "@veltodefi/types";
import { SortOrder } from "@veltodefi/ui";
import { SharePnLConfig } from "@veltodefi/ui-share";

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
