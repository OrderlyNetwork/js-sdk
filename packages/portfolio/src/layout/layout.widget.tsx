import { PropsWithChildren } from "react";
import { PortfolioLayout } from "./layout.ui";
import { useLayoutBuilder } from "./useLayoutBuilder.script";
import type { LayoutProps } from "@orderly.network/ui-scaffold";

export const PortfolioLayoutWidget = (
  props: PropsWithChildren<LayoutProps>
) => {
  const state = useLayoutBuilder();
  return <PortfolioLayout {...state} {...props} children={props.children} />;
};
