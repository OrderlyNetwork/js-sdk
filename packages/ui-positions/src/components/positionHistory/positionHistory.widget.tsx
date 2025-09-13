import React from "react";
import type { API } from "@orderly.network/types";
import { SharePnLConfig } from "@orderly.network/ui-share";
import { usePositionHistoryScript } from "./positionHistory.script";
import { MobilePositionHistory, PositionHistory } from "./positionHistory.ui";

export type PositionHistoryProps = {
  onSymbolChange?: (symbol: API.Symbol) => void;
  symbol?: string;
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig;
};

export const PositionHistoryWidget: React.FC<PositionHistoryProps> = (
  props,
) => {
  const state = usePositionHistoryScript(props);
  return <PositionHistory {...state} sharePnLConfig={props.sharePnLConfig} />;
};

export const MobilePositionHistoryWidget: React.FC<
  PositionHistoryProps & {
    classNames?: { root?: string; content?: string; cell?: string };
  }
> = (props) => {
  const { classNames, ...rest } = props;
  const state = usePositionHistoryScript(rest);
  return (
    <MobilePositionHistory
      {...state}
      classNames={classNames}
      sharePnLConfig={props.sharePnLConfig}
    />
  );
};
