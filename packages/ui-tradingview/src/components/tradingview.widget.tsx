import { forwardRef } from "react";
import { TradingviewWidgetPropsInterface } from "../type";
import { useTradingviewScript } from "./tradingview.script";
import { TradingviewUi } from "./tradingview.ui";

export const TradingviewWidget = forwardRef(
  (widgetProps: TradingviewWidgetPropsInterface, ref) => {
    const state = useTradingviewScript(widgetProps);
    return <TradingviewUi {...state} ref={ref} />;
  },
);
