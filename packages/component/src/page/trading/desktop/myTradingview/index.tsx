import {
  DisplayControlSettingInterface,
  TradingView,
  TradingViewSDKLocalstorageKey,
} from "@orderly.network/trading-view";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { useEffect, useMemo, useState } from "react";
import { SymbolProvider, useSymbolContext } from "@/provider/symbolProvider";
import { toast } from "@/toast";
import {
  useOrderEntry_deprecated,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { CloseBaseConfirm } from "@/block/positions/full/marketConfirmDialog";
import { OrderSide, OrderType } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { Spinner } from "@/spinner";
import TopBar from "@/page/trading/desktop/myTradingview/topBar";
import { ColorConfigInterface } from "@/page/trading/types";

interface IProps {
  symbol: string;
  tradingViewConfig?: {
    scriptSRC?: string;
    library_path: string;
    overrides?: Record<string, string>;
    studiesOverrides?: Record<string, string>;
    customCssUrl?: string;
    colorConfig?: ColorConfigInterface;
  };
}

export default function MyTradingView({ symbol, tradingViewConfig }: IProps) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const { helper, onSubmit, submitting } = useOrderEntry_deprecated(
    symbol,
    side,
    true
  );
  const symbolInfo = useSymbolsInfo()[symbol];
  const [orderData, setOrderData] = useState<any>();
  const [openSetting, setOpenSetting] = useState<boolean>(false);
  const [openIndicators, setOpenIndicators] = useState<boolean>(false);

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

  const positionControlCallback = () => {
    setOpen(true);
  };
  const closePositionConfirmCallback = (data: any) => {
    const side = new Decimal(data.balance).greaterThan(0)
      ? OrderSide.SELL
      : OrderSide.BUY;
    const order: any = {
      //   order_price: undefined,
      order_quantity: data.balance,
      symbol: symbol,
      order_type: OrderType.MARKET,
      side,
      reduce_only: true,
    };
    setOrderData(order);
    setSide(side);
    setOpen(true);
  };

  const onConfirm = async () => {
    orderData.order_quantity = Math.abs(orderData.order_quantity);
    return onSubmit(orderData).then(
      (res) => {
        setOpen(false);
      },
      (error: any) => {
        if (typeof error === "string") {
          toast.error(error);
          return;
        }
        toast.error(error.message);
      }
    );
  };

  const changeInterval = (newInterval: string) => {
    localStorage.setItem(TradingViewSDKLocalstorageKey.interval, newInterval);
    setInterval(newInterval);
  };

  const changeLineType = (newLineType: string) => {
    localStorage.setItem(TradingViewSDKLocalstorageKey.lineType, newLineType);
    setLineType(newLineType);
  };

  const changeDisplaySetting = (newSetting: DisplayControlSettingInterface) => {
    localStorage.setItem(
      TradingViewSDKLocalstorageKey.displayControlSetting,
      JSON.stringify(newSetting)
    );
    setDisplayControlState(newSetting);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div
      className="orderly-flex orderly-flex-col"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <SymbolProvider symbol={symbol}>
        <TopBar
          changeInterval={(interval) => changeInterval(interval)}
          openSettingDialog={() => setOpenSetting(!openSetting)}
          openIndicatorsDialog={() => setOpenIndicators(!openIndicators)}
          changeLineType={(type) => changeLineType(type)}
          interval={interval}
          lineType={lineType}
          displayControlState={displayControlState}
          changeDisplaySetting={changeDisplaySetting}
        />
        <div className="orderly-flex-1">
          <TradingView
            symbol={symbol}
            interval={interval.toString()}
            libraryPath={tradingViewConfig?.library_path}
            tradingViewScriptSrc={tradingViewConfig?.scriptSRC}
            tradingViewCustomCssUrl={tradingViewConfig?.customCssUrl}
            overrides={tradingViewConfig?.overrides}
            studiesOverrides={tradingViewConfig?.studiesOverrides}
            closePositionConfirmCallback={closePositionConfirmCallback}
            topToolbarOpenSetting={openSetting}
            topToolbarOpenIndicators={openIndicators}
            topToolbarLineType={lineType}
            onToast={toast}
            loadingElement={<Spinner />}
            positionControlCallback={positionControlCallback}
            displayControlSetting={displayControlState}
            colorConfig={tradingViewConfig?.colorConfig}
          />
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <div
                style={{
                  position: "absolute",
                  width: "0",
                  height: "0",
                  left: "50%",
                  top: "50%",
                }}
              ></div>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="top"
              className="orderly-w-[340px]"
            >
              <CloseBaseConfirm
                base={symbolInfo("base")}
                quantity={orderData?.order_quantity ?? 0}
                onClose={onClose}
                onConfirm={onConfirm}
                submitting={submitting}
              />
            </PopoverContent>
          </Popover>
        </div>
      </SymbolProvider>
    </div>
  );
}
