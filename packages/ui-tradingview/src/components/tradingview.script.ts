import { TradingviewWidgetPropsInterface } from "../type";
import { useEffect, useMemo, useRef, useState } from "react";
import { getOveriides, withExchangePrefix } from "../utils/chart.util";
import { useAccount, useConfig, useMediaQuery, useWS } from "@orderly.network/hooks";
import { AccountStatusEnum, MEDIA_TABLET } from "@orderly.network/types";
import { ColorConfigInterface } from "../tradingviewAdapter/type";
import useBroker from "../tradingviewAdapter/hooks/useBroker";
import useCreateRenderer from "../tradingviewAdapter/hooks/useCreateRenderer";
import brokerHostHandler from "../tradingviewAdapter/renderer/brokerHostHandler";
import getBrokerAdapter from "../tradingviewAdapter/broker/getBrokerAdapter";
import { Datafeed } from "../tradingviewAdapter/datafeed/datafeed";
import { Widget, WidgetProps } from "../tradingviewAdapter/widget";
import { WebsocketService } from "../tradingviewAdapter/datafeed/websocket.service";
import { WS } from "@orderly.network/net";

const chartKey = "SDK_Tradingview";


const upColor = "#00B59F";
const downColor = "#FB5CB8";
const chartBG = "#16141c";
const pnlUpColor = "#27DEC8";
const pnlDownColor = "#FFA5C0";
const pnlZoreColor = "#808080";
const textColor = "#FFFFFF";
const qtyTextColor = "#F4F7F9";
const font = "regular 11px Manrope";


export function useTradingviewScript(props: TradingviewWidgetPropsInterface){
  const {
    tradingViewScriptSrc,
    overrides: customerOverrides,
    studiesOverrides: customerStudiesOverrides,
    libraryPath,
    tradingViewCustomCssUrl,
    fullscreen,
    symbol,
    interval,
    theme,
    mode,
    colorConfig: customerColorConfig,
  } = props;
  const chart = useRef<any>();
  const apiBaseUrl: string = useConfig("apiBaseUrl") as string;
  const { state: accountState } = useAccount();
  const isMobile = useMediaQuery(MEDIA_TABLET);

  const defaultColorConfig: ColorConfigInterface = {
    upColor,
    downColor,
    chartBG,
    pnlUpColor,
    pnlDownColor,
    pnlZoreColor,
    textColor,
    qtyTextColor,
    font,
    closeIcon: "rgba(255, 255, 255, 0.54)",
  };
  const colorConfig = Object.assign(
    {},
    defaultColorConfig,
    customerColorConfig ?? {}
  );
  const broker = useBroker({
    // todo
    closeConfirm: () => {},
    colorConfig,
    // todo
    onToast: () => {},
    mode,
  });
  const [createRenderer, removeRenderer] = useCreateRenderer(
    symbol!,
    // todo
    {
      position: false,
      tpsl: false,
      limitOrders: false,
      stopOrders: false,
      buySell: false,
      positionTpsl: false,
    },
  );
  const ws = useWS();
  const [chartingLibrarySciprtReady, setChartingLibrarySciprtReady] =
    useState<boolean>(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = useMemo(() => {
    if (accountState.status < AccountStatusEnum.EnableTrading) {
      return false;
    }
    return true;
  }, [accountState]);

  useEffect(() => {
    console.log('-- tradingview script ', tradingViewScriptSrc, chartRef.current, chartingLibrarySciprtReady);
    if (!tradingViewScriptSrc) {
      return;
    }
    if (!chartRef.current) {
      return;

    }
    if (!chartingLibrarySciprtReady) {
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
      chartRef.current.appendChild(script);
    }
  }, [chartRef, chartingLibrarySciprtReady, tradingViewScriptSrc]);

  useEffect(() => {

    if (!symbol) {
      return;
    }
    if (!chartingLibrarySciprtReady || !tradingViewScriptSrc) {
      return;
    }

    const defaultOverrides = getOveriides();
    const overrides = customerOverrides
      ? Object.assign({}, defaultOverrides.overrides, customerOverrides)
      : defaultOverrides.overrides;

    // console.log('-- overrides', overrides);
    const studiesOverrides = customerStudiesOverrides
      ? Object.assign(
        {},
        defaultOverrides.studiesOverrides,
        customerStudiesOverrides
      )
      : defaultOverrides.studiesOverrides;
    if (chartRef.current) {
      const options: any = {
        fullscreen: fullscreen ?? false,
        autosize: true,
        symbol: withExchangePrefix(symbol!),
        // locale: getLocale(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        container: chartRef.current,
        libraryPath: libraryPath,
        customCssUrl: tradingViewCustomCssUrl,
        interval: interval ?? "1",
        theme: theme ?? "dark",

        overrides: overrides,
        studiesOverrides,
        datafeed: new Datafeed(apiBaseUrl!, ws),
        contextMenu: {
          items_processor: async (defaultItems: any) => {
            return defaultItems;
          },
        },
        getBroker: isLoggedIn
          ? (instance: any, host: any) => {
            console.log("-- broker_factory");
            brokerHostHandler(instance, host);
            return getBrokerAdapter(host, broker);
          }
          : undefined,

        // todo
        // positionControlCallback,
      };

      const chartProps: WidgetProps = {
        options,
        chartKey: chartKey,
        mode,
        onClick: () => {},
      };

      chart.current = new Widget(chartProps);
    }

    return () => {
      chart.current?.remove();
    };
  }, [chartingLibrarySciprtReady, isLoggedIn, isMobile]);


  useEffect(() => {
    if (!symbol || !chart.current) {
      return;
    }
    chart.current?.setSymbol(symbol);
    const service = new WebsocketService(ws as WS);
    service.subscribeSymbol(symbol);
    return () => {
      service.unsubscribeKline(symbol);
    };
  }, [symbol]);

  useEffect(() => {
    if (!chart.current) {
      return;
    }
    chart.current.setSymbol(symbol, interval);
  }, [interval]);


  return {tradingViewScriptSrc, chartRef}
}