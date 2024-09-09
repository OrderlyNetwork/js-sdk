import { useLastTradesScript } from "./lastTrades.script";
import { LastTrades } from "./lastTrades.ui";

export const LastTradesWidget = (props: { symbol: string }) => {
  const state = useLastTradesScript(props.symbol);
  return <LastTrades {...state} />;
};
