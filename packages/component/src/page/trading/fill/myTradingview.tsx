import { TradingView } from "@orderly.network/trading-view";

interface Props {
  symbol: string;
  tradingViewConfig?: {
    scriptSRC?: string;
    library_path: string;
    overrides?: Record<string, string>;
    customCssUrl?: string;
  };
}
export const MyTradingView = ({ symbol, tradingViewConfig }: Props) => {
  return (
    <TradingView
      symbol={symbol}
      libraryPath={tradingViewConfig?.library_path}
      tradingViewScriptSrc={tradingViewConfig?.scriptSRC}
      tradingViewCustomCssUrl={tradingViewConfig?.customCssUrl}
      overrides={tradingViewConfig?.overrides}
    />
  );
};
