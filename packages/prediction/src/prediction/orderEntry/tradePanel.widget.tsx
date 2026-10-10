import React from "react";
import {
  useTradePanelScript,
  type TradePanelScriptInput,
} from "./tradePanel.script";
import { TradePanel } from "./tradePanel.ui";

export const TradePanelWidget: React.FC<TradePanelScriptInput> = (props) => (
  <TradePanel {...useTradePanelScript(props)} />
);
