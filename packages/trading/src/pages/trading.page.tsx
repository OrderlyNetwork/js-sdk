import { TradingPageProps } from "../types/types";
import { TradingWidget } from "./trading.widget";


export const TradingPage = (
  props: TradingPageProps
) => {
  return <TradingWidget {...props} />;
};
