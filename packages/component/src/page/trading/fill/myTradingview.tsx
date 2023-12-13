import { TradingView } from "@orderly.network/trading-view";

export const MyTradingView = () => {
  const upColor = "#00B59F";
  const downColor = "#FF67C2";
  const tradingViewOptions = {
    scriptSRC: "/tradingview/charting_library/charting_library.js",
    library_path: "/tradingview/charting_library/",
    tradingViewCustomCssUrl: "/tradingview/chart.css",
    overrides: {
      "paneProperties.background": "#16141c",
      // "paneProperties.background": "#ffff00",
      // "mainSeriesProperties.style": 1,
      "paneProperties.backgroundType": "solid",
      // "paneProperties.background": "#151822",

      "mainSeriesProperties.candleStyle.upColor": upColor,
      "mainSeriesProperties.candleStyle.downColor": downColor,
      "mainSeriesProperties.candleStyle.borderColor": upColor,
      "mainSeriesProperties.candleStyle.borderUpColor": upColor,
      "mainSeriesProperties.candleStyle.borderDownColor": downColor,
      "mainSeriesProperties.candleStyle.wickUpColor": upColor,
      "mainSeriesProperties.candleStyle.wickDownColor": downColor,
      "paneProperties.separatorColor": "#2B2833",
      "paneProperties.vertGridProperties.color": "#26232F",
      "paneProperties.horzGridProperties.color": "#26232F",
      "scalesProperties.textColor": "#97969B",
    },
    studiesOverrides: {
      "volume.volume.color.0": "#613155",
      "volume.volume.color.1": "#14494A",
    },
    theme: "dark",
  };
  return (
    <TradingView
      symbol={"PERP_ETH_USDC"}
      libraryPath={tradingViewOptions.library_path}
      tradingViewScriptSrc={tradingViewOptions.scriptSRC}
      tradingViewCustomCssUrl={tradingViewOptions.tradingViewCustomCssUrl}
      overrides={tradingViewOptions.overrides}
      theme={tradingViewOptions.theme}
      studiesOverrides={tradingViewOptions.studiesOverrides}
    />
  );
};
