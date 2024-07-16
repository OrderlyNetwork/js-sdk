import { PropsWithChildren } from "react";
import { TradingRewardsLayout } from "./layout.ui";
import { useLayoutBuilder } from "./layout.script";
import { LayoutProps, SideBarProps, SideMenuItem } from "@orderly.network/ui-scaffold";

export const TradingRewardsLayoutWidget = (props: PropsWithChildren<LayoutProps & {
  onClickMenuItem?: (item: SideMenuItem) => void;
}> ) => {
  const state = useLayoutBuilder();
  return <TradingRewardsLayout {...state} {...props} children={props.children} />;
};
