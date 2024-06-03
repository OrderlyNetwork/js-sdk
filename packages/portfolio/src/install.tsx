import { ExtensionPositionEnum, installExtension } from "@orderly.network/ui";
import { PortfolioLayout, PortfolioLayoutProps } from "./layout/layout";
import { layoutBuilder } from "./layout/layoutBuilder";

installExtension<PortfolioLayoutProps>({
  name: "Portfolio page layout",
  scope: ["*"],
  __isInternal: true,
  positions: [ExtensionPositionEnum.PortfolioLayout],
  builder: layoutBuilder,
})((props) => {
  return <PortfolioLayout {...props} />;
});

export {};
