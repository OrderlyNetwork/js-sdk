import { API } from "@orderly.network/types";
import { usePositionHistoryScript } from "./positionHistory.script";
import { MobilePositionHistory, PositionHistory } from "./positionHistory.ui";

export type PositionHistoryProps = {
  onSymbolChange?: (symbol: API.Symbol) => void;
};

export const PositionHistoryWidget = (props: PositionHistoryProps) => {
  const state = usePositionHistoryScript(props);
  return <PositionHistory {...state} />;
};

export const MobilePositionHistoryWidget = (
  props: PositionHistoryProps & {
    classNames?: {
      root?: string;
      content?: string;
      cell?: string;
    };
  }
) => {
  const { classNames, ...rest } = props;
  const state = usePositionHistoryScript(rest);
  return <MobilePositionHistory {...state} classNames={classNames} />;
};
