import { PropsWithChildren } from "react";
import { PortfolioLayout } from "./layout.ui";
import { useLayoutBuilder } from "./useLayoutBuilder.script";

export const PortfolioLayoutWidget = (props: PropsWithChildren) => {
  const state = useLayoutBuilder();
  return <PortfolioLayout {...state} children={props.children} />;
};
