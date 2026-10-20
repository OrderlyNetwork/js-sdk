import React from "react";
import {
  useTradeSubMenuScript,
  type TradeSubMenuScriptOptions,
} from "./tradeSubMenu.script";
import { TradeSubMenu } from "./tradeSubMenu.ui";

export type TradeSubMenuWidgetProps = TradeSubMenuScriptOptions & {
  className?: string;
};

/**
 * Trade product switcher for a main-nav sub menu: Perps (with its markets
 * panel), Prediction, and host-provided entries. Navigation goes through the
 * app provider's `onRouteChange`.
 */
export const TradeSubMenuWidget: React.FC<TradeSubMenuWidgetProps> = (
  props,
) => {
  const { className, ...options } = props;
  const state = useTradeSubMenuScript(options);
  return <TradeSubMenu {...state} className={className} />;
};
