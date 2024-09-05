import { TradingPageV2Props } from "../types/types";
import { TradingV2Widget } from "./tradingV2.widget";


export const TradingPageV2 = (
  props: TradingPageV2Props
) => {
  return <TradingV2Widget {...props} />;
};
