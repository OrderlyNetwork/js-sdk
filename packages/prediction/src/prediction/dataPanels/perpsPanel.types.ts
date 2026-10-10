import type { TradingPageProps } from "@orderly.network/trading-common";

/** Host-owned behavior and presentation shared by embedded Perps panels. */
export type PredictionPerpsPanelProps = Pick<
  TradingPageProps,
  "onSymbolChange" | "sharePnLConfig"
> & {
  pnlNotionalDecimalPrecision?: number;
};
