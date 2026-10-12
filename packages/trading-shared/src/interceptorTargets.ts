/// <reference types="@orderly.network/plugin-core" />
import type { Props as AsksProps } from "./components/desktop/orderBook/asks.desktop";
import type { Props as BidsProps } from "./components/desktop/orderBook/bids.desktop";

declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {
    "OrderBook.Desktop.Asks": AsksProps;
    "OrderBook.Desktop.Bids": BidsProps;
  }
}
