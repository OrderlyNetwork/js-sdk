import { FC, PropsWithChildren } from "react";
import { TradingRewardsLayout } from "./layout.ui";
import { useTradingRewardsLayoutScript } from "./layout.script";
import { ScaffoldProps } from "@orderly.network/ui-scaffold";

export const TradingRewardsLayoutWidget: FC<
  PropsWithChildren<ScaffoldProps>
> = (props) => {
  const state = useTradingRewardsLayoutScript({
    current: props.leftSideProps?.current,
  });
  return (
    <TradingRewardsLayout {...state} {...props} children={props.children} />
  );
};
