import { FC } from "react";
import { TradingPageProps } from "./types";
import { TradingPageProvider } from "./context/tradingPageContext";
import { Page } from "@/layout/page";

import { TradingPage as XSTradingPage } from "./xs/trading";
import { TradingPage as FullTradingPage } from "./fill/trading";

export const TradingPage: FC<TradingPageProps> = (props) => {
  return (
    <TradingPageProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
    >
      <Page xs={<XSTradingPage {...props} />}>
        <FullTradingPage {...props} />
      </Page>
    </TradingPageProvider>
  );
};
