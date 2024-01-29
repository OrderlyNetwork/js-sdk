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
      // @ts-ignore
      libraryPath={tradingViewConfig?.library_path}
      // @ts-ignore
      tradingViewScriptSrc={tradingViewConfig?.scriptSRC}
      tradingViewCustomCssUrl={tradingViewConfig?.customCssUrl}
      overrides={tradingViewConfig?.overrides}
    />
  );
};
