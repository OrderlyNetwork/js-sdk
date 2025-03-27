import { FC } from "react";
import { useTradingListScript } from "./tradingList.script";
import { TradingList, TradingListProps } from "./tradingList.ui";

export type TradingListWidgetProps = Pick<
  TradingListProps,
  "style" | "className"
>;

export const TradingListWidget: FC<TradingListWidgetProps> = (props) => {
  const state = useTradingListScript();
  return <TradingList {...state} {...props} />;
};
