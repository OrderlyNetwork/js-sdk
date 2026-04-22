import { injectable } from "@orderly.network/ui";
import type { TradingviewUIPropsInterface } from "../type";
import { TradingviewChart } from "./tradingview.chart";

export const InjectableTradingviewDesktop =
  injectable<TradingviewUIPropsInterface>(
    TradingviewChart,
    "TradingView.Desktop",
  );
