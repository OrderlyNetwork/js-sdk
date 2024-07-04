import { PropsWithChildren } from "react";
import { TradingRewardsLayout } from "./layout.ui";
import { useLayoutBuilder } from "./layout.script";

export const TradingRewardsLayoutWidget = (props: PropsWithChildren) => {
  const state = useLayoutBuilder();
  return <TradingRewardsLayout {...state} children={props.children} />;
};
