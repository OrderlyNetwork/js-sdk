/**
 * Module augmentation: maps interceptor target paths to their component props types.
 * Import from @orderly.network/trading to enable typed props in
 * createInterceptor('Trading.Layout.Desktop', ...), createInterceptor('Account.MobileAccountMenu', ...), etc.
 */
/// <reference types="@orderly.network/plugin-core" />
import type { SymbolInfoBarFullProps } from "@orderly.network/markets";
import type { DataListDesktopTabsProps } from "../components/desktop/dataList/dataList.injectable";
import type { AccountState } from "../components/mobile/bottomNavBar/account/account.script";
import type { DataListMobileTabsProps } from "../components/mobile/dataList/dataList.injectable";
import type { DesktopLayoutProps } from "../pages/trading/trading.ui.desktop";
import type { MobileLayoutProps } from "../pages/trading/trading.ui.mobile";

declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {
    "Account.MobileAccountMenu": AccountState;
    "Trading.DataList.Desktop.Tabs": DataListDesktopTabsProps;
    "Trading.DataList.Mobile.Tabs": DataListMobileTabsProps;
    "Trading.Layout.Desktop": DesktopLayoutProps;
    "Trading.Layout.Mobile": MobileLayoutProps;
    "Trading.SymbolInfoBar.Desktop": SymbolInfoBarFullProps;
  }
}
