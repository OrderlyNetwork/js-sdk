import { DesktopTradingPage } from "./desktop/trading";
import { BaseTradingPage } from "./page";
import { MobileTradingPage } from "./mobile/trading";

export { DataListView } from "./desktop";
export type { TradingPageProps } from "./types";

type TradingPage = typeof BaseTradingPage & {
  mobile: typeof MobileTradingPage;
  desktop: typeof DesktopTradingPage;
};

const TradingPage = BaseTradingPage as TradingPage;
TradingPage.mobile = MobileTradingPage;
TradingPage.desktop = DesktopTradingPage;

export { TradingPage };
