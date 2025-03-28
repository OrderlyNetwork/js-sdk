import { FC } from "react";
import { useTradingListScript } from "./tradingList.script";
import { TradingList, TradingListProps } from "./tradingList.ui";
import { MobileTradingList } from "./tradingList.mobile.ui";

export type TradingListWidgetProps = Pick<
  TradingListProps,
  "style" | "className"
>;

export const TradingListWidget: FC<TradingListWidgetProps> = (props) => {
  const state = useTradingListScript();
  if (state.isMobile) {
    return <MobileTradingList {...state} {...props} />;
  }
  return <TradingList {...state} {...props} />;
};
