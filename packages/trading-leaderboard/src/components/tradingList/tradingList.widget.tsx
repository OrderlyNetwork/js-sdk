import { FC } from "react";
import { MobileTradingList } from "./tradingList.mobile.ui";
import {
  TradingListScriptOptions,
  useTradingListScript,
} from "./tradingList.script";
import { TradingList, TradingListProps } from "./tradingList.ui";

export type TradingListWidgetProps = Pick<
  TradingListProps,
  "style" | "className"
> &
  TradingListScriptOptions;

export const TradingListWidget: FC<TradingListWidgetProps> = (props) => {
  const { dateRange, address, ...rest } = props;
  const state = useTradingListScript({
    dateRange,
    address,
  });

  if (state.isMobile) {
    return <MobileTradingList {...state} {...rest} />;
  }

  return <TradingList {...state} {...rest} />;
};
