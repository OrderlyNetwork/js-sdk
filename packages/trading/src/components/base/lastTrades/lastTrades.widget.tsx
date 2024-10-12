import { useLastTradesScript } from "./lastTrades.script";
import { LastTrades } from "./lastTrades.ui";

export const LastTradesWidget = (props: {
  symbol: string;
  classNames?: {
    root?: string;
    list?: string;
    listHeader?: string;
    listItem?: {
      left?: string;
      mid?: string;
      right?: string;
    }
  };
  style?: React.CSSProperties;
}) => {
  const state = useLastTradesScript(props.symbol);
  return <LastTrades {...state} classNames={props.classNames} style={props.style} />;
};
