import { FC, PropsWithChildren } from "react";
import { TradingRewardsLayout } from "./layout.ui";
import { useTradingRewardsLayoutScript } from "./layout.script";
import { LayoutProps } from "@orderly.network/ui-scaffold";

export const TradingRewardsLayoutWidget: FC<PropsWithChildren<LayoutProps>> = (
  props
) => {
  const state = useTradingRewardsLayoutScript({
    current: props.leftSideProps?.current,
  });
  return (
    <TradingRewardsLayout {...state} {...props} children={props.children} />
  );
};
