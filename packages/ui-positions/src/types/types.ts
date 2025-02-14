import { PriceMode } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { SharePnLConfig } from "@orderly.network/ui-share";

export type PositionsProps = {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig;
  symbol?: string;
  calcMode?: PriceMode;
  includedPendingOrder?: boolean;
  onSymbolChange?: (symbol: API.Symbol) => void;
};
