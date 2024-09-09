import {
  DisplayControlSettingInterface,
  TradingviewWidgetPropsInterface,
} from "../type";
import { useEffect, useMemo, useRef, useState } from "react";
import { getOveriides, withExchangePrefix } from "../utils/chart.util";
import {
  useAccount,
  useConfig,
  useMediaQuery,
  useOrderEntry, useSymbolsInfo,
  useWS
} from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  MEDIA_TABLET,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { ColorConfigInterface } from "../tradingviewAdapter/type";
import useBroker from "../tradingviewAdapter/hooks/useBroker";
import useCreateRenderer from "../tradingviewAdapter/hooks/useCreateRenderer";
import brokerHostHandler from "../tradingviewAdapter/renderer/brokerHostHandler";
import getBrokerAdapter from "../tradingviewAdapter/broker/getBrokerAdapter";
import { Datafeed } from "../tradingviewAdapter/datafeed/datafeed";
import { Widget, WidgetProps } from "../tradingviewAdapter/widget";
import { WebsocketService } from "../tradingviewAdapter/datafeed/websocket.service";
import { WS } from "@orderly.network/net";
import { TradingViewSDKLocalstorageKey } from "../utils/common.util";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useLazyEffect } from "../tradingviewAdapter/hooks/useLazyEffect";

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
    theme,
    mode,
    colorConfig: customerColorConfig,
  } = props;
  const chart = useRef<any>();
  const apiBaseUrl: string = useConfig("apiBaseUrl") as string;
  const { state: accountState } = useAccount();
  const [side, setSide] = useState<OrderSide>(OrderSide.SELL);
  const symbolsInfo = useSymbolsInfo();

  const {onSubmit, submitting } = useOrderEntry({
    symbol: symbol ?? '',
    side: side,
    order_type: OrderType.CLOSE_POSITION,
    reduce_only: true,
  }, {
    watchOrderbook: true,
  });
  const [openCloseConfirmDialog, setOpenCloseConfirmDialog] = useState(false);
  const [orderData, setOrderData] = useState<any>();
  const [displayControlState, setDisplayControlState] =
    useState<DisplayControlSettingInterface>(() => {
      const displaySettingInfo = localStorage.getItem(
        TradingViewSDKLocalstorageKey.displayControlSetting
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
      };
    });


  const [interval, setInterval] = useState<string>(() => {
    const lastUsedInterval = localStorage.getItem(
      TradingViewSDKLocalstorageKey.interval
    );
    if (!lastUsedInterval) {
      return "1";
    }
    return lastUsedInterval;
  });

  const [lineType, setLineType] = useState<string>(() => {
    const lastUsedLineType = localStorage.getItem(
      TradingViewSDKLocalstorageKey.lineType
    );
    if (!lastUsedLineType) {
      return "1";
    }
    return lastUsedLineType;
  });

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

  const ws = useWS();
  const [chartingLibrarySciprtReady, setChartingLibrarySciprtReady] =
    useState<boolean>(false);

  const closePositionConfirmCallback = (data: any) => {
    // todo need update code
    const symbolInfo = symbolsInfo[symbol!];
    if (!symbolInfo) {
      return;
    }
    const side = new Decimal(data.balance).greaterThan(0)
      ? OrderSide.SELL
      : OrderSide.BUY;
    const order: any = {
      //   order_price: undefined,
      order_quantity: data.balance,
      symbol: symbol,
      order_type: OrderType.MARKET,
      side,
      base: symbolInfo('base'),
      reduce_only: true,
    };
    setOrderData(order);
    setSide(side);
    setOpenCloseConfirmDialog(true);
  };

  const chartRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = useMemo(() => {
    if (accountState.status < AccountStatusEnum.EnableTrading) {
      return false;
    }
    return true;
  }, [accountState]);

  const broker = useBroker({
    closeConfirm: closePositionConfirmCallback,
    colorConfig,
    onToast: toast,
    mode,
  });
  const [createRenderer, removeRenderer] = useCreateRenderer(
    symbol!,
    displayControlState,
  );

  const changeInterval = (newInterval: string) => {
    if (!chart.current) {
      return;
    }
    localStorage.setItem(TradingViewSDKLocalstorageKey.interval, newInterval);
    setInterval(newInterval);
    chart.current.setSymbol(symbol, interval);

  };

  const changeLineType = (newLineType: string) => {
    if (!chart.current) {
      return;
    }
    localStorage.setItem(TradingViewSDKLocalstorageKey.lineType, newLineType);
    setLineType(newLineType);
    chart.current.changeLineType(Number(newLineType));
  };

  const changeDisplaySetting = (newSetting: DisplayControlSettingInterface) => {
    localStorage.setItem(
      TradingViewSDKLocalstorageKey.displayControlSetting,
      JSON.stringify(newSetting)
    );
    setDisplayControlState(newSetting);
  };

  const openChartSetting = () => {
    if (!chart.current) {
      return;
    }
    chart.current.executeActionById('chartProperties');
  }

  const openChartIndicators = () => {
    if (!chart.current) {
      return;
    }
    chart.current.executeActionById('insertIndicator');
  }

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
        // todo broker effect sell/buy
        // getBroker: isLoggedIn
        //   ? (instance: any, host: any) => {
        //     console.log("-- broker_factory");
        //     brokerHostHandler(instance, host);
        //     return getBrokerAdapter(host, broker);
        //   }
        //   : undefined,
        getBroker: undefined,
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
  }, [chartingLibrarySciprtReady, isMobile]);


  useEffect(() => {
    if (chart.current && chart.current.instance) {
      chart.current.instance.onChartReady(() => {
        console.log("-- chart ready");
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


  return {tradingViewScriptSrc, chartRef,
    changeDisplaySetting,
    displayControlState,
    interval,
    changeInterval,
    lineType,
    changeLineType,
    openChartSetting,
    openChartIndicators,
    openCloseConfirmDialog,
    setOpenCloseConfirmDialog,
    orderData,
    onSubmit,
    submitting,
    symbol,
  }
}