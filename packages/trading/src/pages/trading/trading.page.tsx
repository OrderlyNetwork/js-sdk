import React from "react";
import { TradingPageProvider } from "../../provider/tradingPageProvider";
import type { TradingPageProps } from "../../types/types";
import { TradingWidget } from "./trading.widget";

export const TradingPage: React.FC<TradingPageProps> = (props) => (
  <TradingPageProvider {...props}>
    <TradingWidget />
  </TradingPageProvider>
);
