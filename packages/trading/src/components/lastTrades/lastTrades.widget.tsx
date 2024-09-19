import { useLastTradesScript } from "./lastTrades.script";
import { LastTrades } from "./lastTrades.ui";

export const LastTradesWidget = (props: {
  symbol: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const state = useLastTradesScript(props.symbol);
  return <LastTrades {...state} className={props.className} style={props.style} />;
};
