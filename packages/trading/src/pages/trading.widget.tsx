import { TradingPageProps } from "../types/types";
import { Trading } from "./trading.ui";

export const TradingWidget = (props: TradingPageProps) => {
  return <Trading {...props} />;
};
