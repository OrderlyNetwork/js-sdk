import { TradingviewWidgetPropsInterface } from "../type";
import { useEffect, useState } from "react";

export function useTradingviewScript(props: TradingviewWidgetPropsInterface){
  const {tradingViewScriptSrc} = props;
  const [chartingLibrarySciprtReady, setChartingLibrarySciprtReady] =
    useState<boolean>(false);

  useEffect(() => {
    if (!tradingViewScriptSrc) {
      return;
    }
    if (chartingLibrarySciprtReady) {
      const script = document.createElement("script");
      script.setAttribute("data-nscript", "afterInteractive");
      script.src = tradingViewScriptSrc;
      script.async = true;
      script.type = "text/javascript";
      script.onload = () => {
        setChartingLibrarySciprtReady(true);
      };
      script.onerror = () => {
        console.log("trading view path error");
      };
      console.log('document.querySelector(\'#sdk-tradingview\')', document.querySelector('#sdk-tradingview'));
      document.querySelector('#sdk-tradingview')?.appendChild(script);
    }
  }, [ tradingViewScriptSrc]);
  return {tradingViewScriptSrc}
}