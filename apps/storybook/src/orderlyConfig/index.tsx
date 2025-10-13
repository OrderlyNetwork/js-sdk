import type {
  BottomNavProps,
  FooterProps,
  MainNavWidgetProps,
} from "@kodiak-finance/orderly-ui-scaffold";
import type { OrderlyAppProviderConfigProps } from "./orderlyAppProvider";
import type { TradingPageConfigProps } from "./tradingPage";

export { useBottomNav } from "./bottomNav";
export { footerConfig } from "./footer";
export { useMainNav } from "./mainNav";
export { orderlyAppProviderConfig } from "./orderlyAppProvider";
export { tradingPageConfig } from "./tradingPage";

export type OrderlyConfig = {
  orderlyAppProvider: OrderlyAppProviderConfigProps;
  scaffold: {
    mainNavProps: MainNavWidgetProps;
    bottomNavProps: BottomNavProps;
    footerProps: FooterProps;
  };
  tradingPage: TradingPageConfigProps;
};