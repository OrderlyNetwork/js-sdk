import { TradingPageV1Props } from "../../types/types";
import { TradingWidget } from "./tradingV1.widget";


export const TradingPageV1 = (props: TradingPageV1Props) => {
  return <TradingWidget {...props} />;
};
