import { FC } from "react";
import { MobileTradingList } from "./tradingList.mobile.ui";
import { useTradingListScript } from "./tradingList.script";
import { TradingList, TradingListProps } from "./tradingList.ui";

export type TradingListWidgetProps = Pick<
  TradingListProps,
  "style" | "className"
>;

/**
 * @deprecated use TradingListPage instead
 * it will be removed in next version
 */
export const TradingListWidget: FC<TradingListWidgetProps> = (props) => {
  const state = useTradingListScript();
  if (state.isMobile) {
    return <MobileTradingList {...state} {...props} />;
  }
  return <TradingList {...state} {...props} />;
};
