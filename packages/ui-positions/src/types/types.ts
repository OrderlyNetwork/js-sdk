import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";

export type PositionsProps = {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
};
