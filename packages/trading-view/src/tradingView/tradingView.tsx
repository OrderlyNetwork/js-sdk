import React, { useRef, useEffect, useState, useMemo } from "react";
import { Datafeed } from "./tradingViewAdapter/datafeed/datafeed";
import { ChartMode, ColorConfigInterface } from "./tradingViewAdapter/type";
import { Widget, WidgetProps } from "./tradingViewAdapter/widget";
import { WebsocketService } from "./tradingViewAdapter/datafeed/websocket.service";
import { useLazyEffect } from "./tradingViewAdapter/hooks/useLazyEffect";
import {
  useWS,
  useConfig,
  useAccount,
  useMediaQuery,
} from "@orderly.network/hooks";
import { WS } from "@orderly.network/net";
import useBroker from "./tradingViewAdapter/hooks/useBroker";
import useCreateRenderer from "./tradingViewAdapter/hooks/useCreateRenderer";
import getBrokerAdapter from "./tradingViewAdapter/broker/getBrokerAdapter";
import { AccountStatusEnum, MEDIA_TABLET } from "@orderly.network/types";
import { withExchangePrefix } from "./tradingViewAdapter/util";
import brokerHostHandler from "./tradingViewAdapter/renderer/brokerHostHandler";

export { Datafeed };

export interface TradingViewOptions {}

export const TradingViewSDKLocalstorageKey = {
  interval: "TradingviewSDK.lastUsedTimeBasedResolution",
  lineType: "TradingviewSDK.lastUsedStyle",
  displayControlSetting: "TradingviewSDK.displaySetting",
};

export interface DisplayControlSettingInterface {
  position: boolean;
  buySell: boolean;
  limitOrders: boolean;
  stopOrders: boolean;
  tpsl: boolean;
  positionTpsl: boolean;
}

export interface TradingViewPorps {
  symbol?: string;
  mode?: ChartMode;
  libraryPath?: string;
  tradingViewScriptSrc?: string;
  tradingViewCustomCssUrl?: string;
  interval?: string;
  overrides?: Record<string, string>;
  studiesOverrides?: Record<string, string>;
  theme?: string;
  fullscreen?: boolean;
  closePositionConfirmCallback?: (data: any) => void;
  onToast?: any;
  loadingElement?: any;
  positionControlCallback?: Function;
  topToolbarOpenSetting?: boolean;
  topToolbarOpenIndicators?: boolean;
  topToolbarLineType?: string;
  displayControlSetting?: DisplayControlSettingInterface;
  colorConfig?: ColorConfigInterface;
}

function Link(props: { url: string; children?: any }) {
  return (
    <span
      onClick={() => window.open(props.url)}
      style={{
        color: "rgba(var(--orderly-color-primary-darken, 1))",
      }}
    >
      {props.children}
    </span>
  );
}

const upColor = "#00B59F";
const downColor = "#FB5CB8";
const chartBG = "#16141c";
const pnlUpColor = "#27DEC8";
const pnlDownColor = "#FFA5C0";
const pnlZoreColor = "#808080";
const textColor = "#FFFFFF";
const qtyTextColor = "#F4F7F9";
const font = "regular 11px Manrope";

const getOveriides = () => {
  const overrides = {
    "paneProperties.background": chartBG,
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
    "paneProperties.legendProperties.showSeriesTitle": false,
  };
  const studiesOverrides = {
    "volume.volume.color.0": "#613155",
    "volume.volume.color.1": "#14494A",
  };

  return {
    overrides,
    studiesOverrides,
  };
};

export function TradingView({
  symbol,
  mode = ChartMode.UNLIMITED,
  libraryPath,
  tradingViewScriptSrc,
  tradingViewCustomCssUrl,
  interval,
  overrides: customerOverrides,
  theme,
  studiesOverrides: customerStudiesOverrides,
  fullscreen,
  closePositionConfirmCallback,
  onToast,
  loadingElement,

  positionControlCallback,
  topToolbarOpenSetting,
  topToolbarOpenIndicators,
  topToolbarLineType,
  displayControlSetting,
  colorConfig: customerColorConfig,
}: TradingViewPorps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>();
  const apiBaseUrl: string = useConfig("apiBaseUrl") as string;
  const { state: accountState } = useAccount();
  const isMobile = useMediaQuery(MEDIA_TABLET);

  const ws = useWS();
  const [chartingLibrarySciprtReady, setChartingLibrarySciprtReady] =
    useState<boolean>(false);

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
    closeConfirm: closePositionConfirmCallback,
    colorConfig,
    onToast,
    mode,
  });
  const [createRenderer, removeRenderer] = useCreateRenderer(
    symbol!,
    displayControlSetting
  );
  const chartMask = useRef<HTMLDivElement>(null);

  const isLoggedIn = useMemo(() => {
    if (accountState.status < AccountStatusEnum.EnableTrading) {
      return false;
    }
    return true;
  }, [accountState]);

  useEffect(() => {
    if (chart.current && chartMask.current) {
      chart.current.instance.onChartReady(() => {
        console.log("-- chart ready");
        chartMask.current?.style.setProperty("display", "none");
        if (isLoggedIn && chart.current.instance) {
          createRenderer(chart.current.instance, undefined, broker);
        }
      });
    }
    return () => {
      removeRenderer();
    };
  }, [chart.current, isLoggedIn]);

  useEffect(() => {
    if (!tradingViewScriptSrc) {
      return;
    }
    if (chartRef.current) {
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
  }, [chartRef, tradingViewScriptSrc]);

  const onChartClick = () => {};
  const chartKey = "SDK_Tradingview";

  useLazyEffect(() => {
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

        positionControlCallback,
      };

      const chartProps: WidgetProps = {
        options,
        chartKey: chartKey,
        mode,
        onClick: onChartClick,
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

  useEffect(() => {
    if (!chart.current) {
      return;
    }
    chart.current.executeActionById("chartProperties");
  }, [topToolbarOpenSetting]);

  useEffect(() => {
    if (!chart.current) {
      return;
    }
    chart.current.executeActionById("insertIndicator");
  }, [topToolbarOpenIndicators]);

  useEffect(() => {
    if (!chart.current) {
      return;
    }
    chart.current.changeLineType(Number(topToolbarLineType));
  }, [topToolbarLineType]);
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {tradingViewScriptSrc && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            background: "#16141c",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          ref={chartMask}
        >
          {loadingElement ?? <div>laoding</div>}
        </div>
      )}
      <div
        style={{
          height: "100%",
          width: "100%",
          margin: "0 auto",
        }}
        ref={chartRef}
      >
        {!tradingViewScriptSrc && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                color: "rgb(var(--orderly-color-base-foreground) / 0.98)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "left",
                height: "100%",
                padding: "20px",
                fontSize: "14px",
                lineHeight: "1.3rem",
                margin: "0 auto",
              }}
            >
              <p
                style={{
                  marginBottom: "24px",
                }}
              >
                Due to TradingView's policy, you will need to apply for your own
                license.
              </p>

              <p
                style={{
                  marginBottom: "12px",
                }}
              >
                1.&nbsp;Please apply for your TradingView license{" "}
                <Link url="">here</Link>.
              </p>
              <p>
                2.&nbsp;Follow the instructions on{" "}
                <Link url="">sdk.orderly.network</Link> to set up.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
