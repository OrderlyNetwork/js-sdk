import { TradingView } from "@orderly.network/trading-view";

interface Props {
  symbol: string;
  tradingViewConfig?: {
    scriptSRC?: string;
    library_path: string;
    customCssUrl?: string;
  };
}
export const MyTradingView = ({ symbol, tradingViewConfig }: Props) => {
  return (
    <TradingView
      symbol={symbol}
      libraryPath={tradingViewConfig?.library_path}
      tradingViewScriptSrc={tradingViewConfig?.scriptSRC}
    />
  );
};
