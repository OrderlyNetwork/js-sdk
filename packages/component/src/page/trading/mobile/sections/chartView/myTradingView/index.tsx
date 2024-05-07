import { SymbolProvider } from "@/provider";
import { toast } from "@/toast";
import { Spinner } from "@/spinner";
import { useState } from "react";
import {
  DisplayControlSettingInterface,
  TradingViewSDKLocalstorageKey,
  TradingView,
  ChartMode,
} from "@orderly.network/trading-view";
import TopBar from "./topBar";

interface IProps {
  symbol: string;
  tradingViewConfig?: {
    scriptSRC?: string;
    library_path: string;
    overrides?: Record<string, string>;
    studiesOverrides?: Record<string, string>;
    customCssUrl?: string;
  };
}

export default function MyTradingView({ symbol, tradingViewConfig }: IProps) {
  const [interval, setInterval] = useState<string>(() => {
    const lastUsedInterval = localStorage.getItem(
      TradingViewSDKLocalstorageKey.interval
    );
    if (!lastUsedInterval) {
      return "1";
    }
    return lastUsedInterval;
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

  const changeInterval = (newInterval: string) => {
    localStorage.setItem(TradingViewSDKLocalstorageKey.interval, newInterval);
    setInterval(newInterval);
  };

  const changeDisplaySetting = (newSetting: DisplayControlSettingInterface) => {
    localStorage.setItem(
      TradingViewSDKLocalstorageKey.displayControlSetting,
      JSON.stringify(newSetting)
    );
    setDisplayControlState(newSetting);
  };

  return (
    <div
      className="orderly-flex orderly-flex-col orderly-h-[240px]"
      style={{ position: "relative", width: "100%" }}
    >
      <SymbolProvider symbol={symbol}>
        <TopBar
          changeInterval={(interval) => changeInterval(interval)}
          interval={interval}
          displayControlState={displayControlState}
          changeDisplaySetting={changeDisplaySetting}
        />
        <div className="orderly-flex-1">
          <TradingView
            mode={ChartMode.MOBILE}
            symbol={symbol}
            interval={interval.toString()}
            libraryPath={tradingViewConfig?.library_path}
            tradingViewScriptSrc={tradingViewConfig?.scriptSRC}
            tradingViewCustomCssUrl={tradingViewConfig?.customCssUrl}
            overrides={tradingViewConfig?.overrides}
            studiesOverrides={tradingViewConfig?.studiesOverrides}
            onToast={toast}
            loadingElement={<Spinner />}
            displayControlSetting={displayControlState}
          />
        </div>
      </SymbolProvider>
    </div>
  );
}
