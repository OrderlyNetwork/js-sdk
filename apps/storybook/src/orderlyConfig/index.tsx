import type {
  FooterProps,
  MainNavWidgetProps,
  BottomNavProps,
} from "@orderly.network/ui-scaffold";
import type { OrderlyAppProviderConfigProps } from "./orderlyAppProvider";
import type { TradingPageConfigProps } from "./tradingPage";

export { orderlyAppProviderConfig } from "./orderlyAppProvider";
export { tradingPageConfig } from "./tradingPage";
export { footerConfig } from "./footer";
export { useMainNav } from "./mainNav";
export { useBottomNav } from "./bottomNav";

export type OrderlyConfig = {
  orderlyAppProvider: OrderlyAppProviderConfigProps;
  scaffold: {
    mainNavProps: MainNavWidgetProps;
    bottomNavProps: BottomNavProps;
    footerProps: FooterProps;
  };
  tradingPage: TradingPageConfigProps;
};
