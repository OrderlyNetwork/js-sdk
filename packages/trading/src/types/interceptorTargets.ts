/**
 * Module augmentation: maps interceptor target paths to their component props types.
 * Import from @orderly.network/trading to enable typed props in
 * createInterceptor('Account.MobileAccountMenu', ...) and createInterceptor('OrderBook.Desktop.Asks', ...).
 */
import type { Props as OrderBookDesktopAsksProps } from "../components/desktop/orderBook/asks.desktop";
import type { Props as OrderBookDesktopBidsProps } from "../components/desktop/orderBook/bids.desktop";
import type { AccountState } from "../components/mobile/bottomNavBar/account/account.script";

declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {
    "Account.MobileAccountMenu": AccountState;
    "OrderBook.Desktop.Asks": OrderBookDesktopAsksProps;
    "OrderBook.Desktop.Bids": OrderBookDesktopBidsProps;
  }
}
