import { FC, PropsWithChildren } from "react";
import { TradingRewardsLayout } from "./layout.ui";
import { useLayoutBuilder } from "./layout.script";
import { LayoutProps, SideBarProps, SideMenuItem } from "@orderly.network/ui-scaffold";

export const TradingRewardsLayoutWidget: FC<PropsWithChildren<LayoutProps>> = (props) => {  
  const state = useLayoutBuilder({
    current: props.leftSideProps?.current
  });
  return <TradingRewardsLayout {...state} {...props} children={props.children} />;
};
