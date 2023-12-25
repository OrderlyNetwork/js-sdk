import { TradingView } from "@orderly.network/trading-view";

export const MyTradingView = () => {
  const tradingViewOptions = {
    tradingViewScriptSrc: "/tradingview/charting_library/charting_library.js",
    libraryPath: "/tradingview/charting_library/",
    tradingViewCustomCssUrl: "/tradingview/chart.css",
    theme: "dark",
  };
  return (
    <TradingView
      symbol={"PERP_ETH_USDC"}
      libraryPath={tradingViewOptions.libraryPath}
      tradingViewScriptSrc={tradingViewOptions.tradingViewScriptSrc}
    />
  );
};
