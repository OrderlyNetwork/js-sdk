import { PriceMode } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { SortOrder } from "@orderly.network/ui";
import { SharePnLConfig } from "@orderly.network/ui-share";

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
