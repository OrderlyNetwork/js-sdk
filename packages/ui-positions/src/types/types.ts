import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";
import { PriceMode } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";


export type PositionsProps = {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;

  symbol?: string;
  calcMode?: PriceMode;
  includedPendingOrder?: boolean;
  onSymbolChange?: (symbol: API.Symbol) => void;
};
