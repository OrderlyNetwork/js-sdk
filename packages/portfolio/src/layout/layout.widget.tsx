import { PropsWithChildren } from "react";
import { PortfolioLayout } from "./layout.ui";
import { useLayoutBuilder } from "./useLayoutBuilder.script";

export const PortfolioLayoutWidget = (props: PropsWithChildren) => {
  const state = useLayoutBuilder();
  console.log("PortfolioLayoutWidget ---->>>>>>", state);
  return <PortfolioLayout {...state} children={props.children} />;
};
