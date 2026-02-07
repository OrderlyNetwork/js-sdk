import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useConfig,
  useLocalStorage,
  useOrderEntry_deprecated,
  useSymbolsInfo,
  useWS,
} from "@orderly.network/hooks";
import { LocaleCode, useLocaleCode } from "@orderly.network/i18n";
import { WS } from "@orderly.network/net";
import {
  AccountStatusEnum,
  OrderSide,
  OrderType,
  TradingviewFullscreenKey,
} from "@orderly.network/types";
import { modal, toast, useOrderlyTheme, useScreen } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useCssVariables } from "../hooks/useCssVariables";
import getBrokerAdapter from "../tradingviewAdapter/broker/getBrokerAdapter";
import { LoadingScreenOptions } from "../tradingviewAdapter/charting_library";
import { Datafeed } from "../tradingviewAdapter/datafeed/datafeed";
import { WebsocketService } from "../tradingviewAdapter/datafeed/websocket.service";
import useBroker from "../tradingviewAdapter/hooks/useBroker";
import useCreateRenderer from "../tradingviewAdapter/hooks/useCreateRenderer";
import brokerHostHandler from "../tradingviewAdapter/renderer/brokerHostHandler";
import { Widget, WidgetProps } from "../tradingviewAdapter/widget";
import {
  DisplayControlSettingInterface,
  TradingviewWidgetPropsInterface,
} from "../type";
import {
  getOveriides,
  withExchangePrefix,
  getColorConfig,
  getOverridesConfigHash,
} from "../utils/chart.util";
import { TradingViewSDKLocalstorageKey } from "../utils/common.util";

const getChartLocalStorageKey = (suffix: string, isMobile?: boolean) => {
  return isMobile
    ? `orderly_tradingview_mobile_${suffix}`
    : `orderly_tradingview_${suffix}`;
};

const defaultLocale = (localeCode: LocaleCode) => {
  return localeCode === "id"
    ? "id_ID"
    : localeCode === "tc"
      ? "zh_TW"
      : localeCode;
};

export function useTradingviewScript(props: TradingviewWidgetPropsInterface) {
  const {
    scriptSRC: tradingViewScriptSrc,
    libraryPath,
    customCssUrl: tradingViewCustomCssUrl,
    overrides: customerOverrides,
    studiesOverrides: customerStudiesOverrides,
    symbol,
    loadingScreen: customerLoadingScreen,
    mode,
    colorConfig: customerColorConfig,
    locale = defaultLocale,
    classNames,
    enabled_features,
    disabled_features,
  } = props;

  const localeCode = useLocaleCode();
  const { isMobile } = useScreen();
  const { currentTheme } = useOrderlyTheme();
  const theme = props.theme ?? currentTheme?.mode ?? "dark";
  const cssVariables = useCssVariables(theme);

  const chart = useRef<Widget | null>(null);
  const apiBaseUrl: string = useConfig("apiBaseUrl") as string;
  const { state: accountState } = useAccount();
  const [side, setSide] = useState<OrderSide>(OrderSide.SELL);
  const symbolsInfo = useSymbolsInfo();
  const [fullscreen, setFullscreen] = useLocalStorage(
    TradingviewFullscreenKey,
    false,
  );

  const { onSubmit, submitting } = useOrderEntry_deprecated(
    {
      symbol: symbol ?? "",
      side: side,
      order_type: OrderType.MARKET,
    },
    {
      watchOrderbook: true,
    },
  );
  const [displayControlState, setDisplayControlState] =
    useState<DisplayControlSettingInterface>(() => {
      const displaySettingInfo = localStorage.getItem(
        TradingViewSDKLocalstorageKey.displayControlSetting,
      );
      if (displaySettingInfo) {
        return JSON.parse(displaySettingInfo) as DisplayControlSettingInterface;
      }
      return {
        position: true,
        buySell: true,
        limitOrders: true,
        stopOrders: true,
        tpsl: true,
        positionTpsl: true,
        trailingStop: true,
      };
    });

  const [interval, setInterval] = useState<string>(() => {
    const lastUsedInterval = localStorage.getItem(
      TradingViewSDKLocalstorageKey.interval,
    );
    if (!lastUsedInterval) {
      return "15";
    }
    return lastUsedInterval;
  });

  const [lineType, setLineType] = useState<string>(() => {
    const lastUsedLineType = localStorage.getItem(
      TradingViewSDKLocalstorageKey.lineType,
    );
    if (!lastUsedLineType) {
      return "1";
    }
    return lastUsedLineType;
  });

  const colorConfig = useMemo(() => {
    return getColorConfig({
      theme,
      customerColorConfig,
      cssVariables,
    });
  }, [theme, customerColorConfig, cssVariables]);

  const ws = useWS();
  const [chartingLibrarySciprtReady, setChartingLibrarySciprtReady] =
    useState<boolean>(false);

  const closePositionConfirmCallback = (data: any) => {
    const symbolInfo = symbolsInfo[symbol!];
    if (!symbolInfo) {
      return;
    }
    const side = new Decimal(data.balance).greaterThan(0)
      ? OrderSide.SELL
      : OrderSide.BUY;
    const order: any = {
      //   order_price: undefined,
      order_quantity: new Decimal(data.balance).abs().toNumber(),
      symbol: symbol,
      order_type: OrderType.MARKET,
      side,
      reduce_only: true,
    };
    setSide(side);
    modal.show("MarketCloseConfirmID", {
      base: symbolInfo("base"),
      quantity: data.balance,
      onConfirm: async () => {
        return onSubmit(order).catch((error) => {
          if (typeof error === "string") {
            toast.error(error);
          } else {
            toast.error(error.message);
          }
        });
      },
      submitting,
    });
  };

  const chartRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = useMemo(() => {
    if (
      accountState.status < AccountStatusEnum.EnableTrading &&
      accountState.status !== AccountStatusEnum.EnableTradingWithoutConnected
    ) {
      return false;
    }
    return true;
  }, [accountState]);

  const broker = useBroker({
    closeConfirm: closePositionConfirmCallback,
    colorConfig,
    onToast: toast,
    symbol: symbol ?? "",
    mode,
  });
  const [createRenderer, removeRenderer] = useCreateRenderer(
    symbol!,
    displayControlState,
  );

  const onFullScreenChange = () => {
    if (fullscreen) {
      setFullscreen(false);
    } else {
      setFullscreen(true);
    }
    props.onFullScreenChange?.(!fullscreen);
  };

  const changeInterval = (newInterval: string) => {
    if (!chart.current) {
      return;
    }
    localStorage.setItem(TradingViewSDKLocalstorageKey.interval, newInterval);
    setInterval(newInterval);
    // chart.current?.setSymbol(symbol ?? "", newInterval as any);
    chart.current?.setResolution(newInterval);
    // chart.current?.setResolution(newInterval)
  };

  const changeLineType = (newLineType: string) => {
    if (!chart.current) {
      return;
    }
    localStorage.setItem(TradingViewSDKLocalstorageKey.lineType, newLineType);
    setLineType(newLineType);
    chart.current?.changeLineType(Number(newLineType));
  };

  const changeDisplaySetting = (newSetting: DisplayControlSettingInterface) => {
    localStorage.setItem(
      TradingViewSDKLocalstorageKey.displayControlSetting,
      JSON.stringify(newSetting),
    );
    setDisplayControlState(newSetting);
  };

  const openChartSetting = () => {
    if (!chart.current) {
      return;
    }
    chart.current.executeActionById("chartProperties");
  };

  const openChartIndicators = () => {
    if (!chart.current) {
      return;
    }
    chart.current.executeActionById("insertIndicator");
  };

  useEffect(() => {
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

  const { overrides, studiesOverrides, configHash, toolbarBg, loadingScreen } =
    useMemo(() => {
      const defaultOverrides = getOveriides({
        theme,
        colorConfig,
        isMobile,
      });

      const overrides = { ...defaultOverrides.overrides, ...customerOverrides };
      const studiesOverrides = {
        ...defaultOverrides.studiesOverrides,
        ...customerStudiesOverrides,
      };

      const configHash = getOverridesConfigHash(
        theme,
        overrides,
        studiesOverrides,
      );

      const toolbarBg = cssVariables.chartBG;

      const loadingScreen =
        customerLoadingScreen ??
        ({
          backgroundColor: colorConfig.chartBG,
          foregroundColor: cssVariables.primary,
        } as LoadingScreenOptions);

      return {
        overrides,
        studiesOverrides,
        configHash,
        toolbarBg,
        loadingScreen,
      };
    }, [
      theme,
      colorConfig,
      isMobile,
      customerOverrides,
      customerStudiesOverrides,
      customerLoadingScreen,
    ]);

  useEffect(() => {
    if (!symbol) {
      return;
    }
    if (!chartingLibrarySciprtReady || !tradingViewScriptSrc) {
      return;
    }

    if (chartRef.current) {
      // options example: https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
      // ChartingLibraryWidgetOptions
      const options: any = {
        // fullscreen: fullscreen ?? false,
        fullscreen: false,
        autosize: true,
        symbol: withExchangePrefix(symbol!),
        locale: typeof locale === "function" ? locale(localeCode) : locale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        container: chartRef.current,
        libraryPath: libraryPath,
        customCssUrl: tradingViewCustomCssUrl,
        interval: interval ?? "1",
        theme,
        loadingScreen,
        toolbarBg,
        overrides,
        studiesOverrides,
        datafeed: new Datafeed(apiBaseUrl!, ws),
        contextMenu: {
          items_processor: async (defaultItems: any) => {
            return defaultItems;
          },
        },
        // todo broker effect sell/buy
        getBroker: (instance: any, host: any) => {
          console.log("-- broker_factory");
          brokerHostHandler(instance, host);
          return getBrokerAdapter(host, broker);
        },
      };

      const chartProps: WidgetProps = {
        options,
        chartKey: getChartLocalStorageKey(`${configHash}`, isMobile),
        mode,
        onClick: () => {},
        enabled_features,
        disabled_features,
      };

      chart.current = new Widget(chartProps);
    }

    return () => {
      chart.current?.remove();
    };
  }, [
    isMobile,
    mode,
    chart,
    chartRef,
    chartingLibrarySciprtReady,
    tradingViewScriptSrc,
    locale,
    localeCode,
    theme,
    overrides,
    studiesOverrides,
    configHash,
    loadingScreen,
    toolbarBg,
  ]);

  useEffect(() => {
    ws.on(
      "status:change",
      (message: any) => {
        if (!message.isPrivate && message.isReconnect) {
          if (
            typeof (window as any).onResetCacheNeededCallback === "function"
          ) {
            (window as any).onResetCacheNeededCallback();
            if (chart.current?.instance) {
              chart.current?.instance.activeChart()?.resetData();
            }
          }
        }
      },
      "tradingview",
    );
  }, [ws]);

  useEffect(() => {
    if (chart.current && chart.current?.instance) {
      chart.current?.instance?.onChartReady(() => {
        if (isLoggedIn && chart.current?.instance) {
          createRenderer(
            chart.current.instance,
            undefined,
            broker,
            chartRef.current!,
          );
        }
      });
    }
    return () => {
      removeRenderer();
    };
  }, [chart.current, isLoggedIn]);

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

  return {
    tradingViewScriptSrc,
    chartRef,
    changeDisplaySetting,
    displayControlState,
    interval,
    changeInterval,
    lineType,
    changeLineType,
    openChartSetting,
    openChartIndicators,
    symbol,
    onFullScreenChange,
    classNames,
    fullscreen,
  };
}
