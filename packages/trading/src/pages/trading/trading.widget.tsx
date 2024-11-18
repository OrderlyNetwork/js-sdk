import { useTradingScript } from "./trading.script";
import { Trading } from "./trading.ui";

export const TradingWidget = () => {
  const state = useTradingScript();
  return <Trading {...state} />;
};
