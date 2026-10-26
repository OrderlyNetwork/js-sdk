import React from "react";
import { injectable } from "@orderly.network/ui";
import { TradingPageProvider } from "../../provider/tradingPageProvider";
import type { TradingPageProps } from "../../types/types";
import { TradingWidget } from "./trading.widget";

const TradingPageInner: React.FC<TradingPageProps> = (props) => (
  <TradingPageProvider {...props}>
    <TradingWidget />
  </TradingPageProvider>
);

/** Existing layout plugins can still supply layoutStrategy/getInitialLayout. */
export const TradingPage = injectable(TradingPageInner, "Trading.Page");
