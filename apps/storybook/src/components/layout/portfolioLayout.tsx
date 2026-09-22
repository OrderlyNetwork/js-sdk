import { FC, ReactNode } from "react";
import {
  PortfolioLeftSidebarPath,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";
import { footerConfig, useBottomNav, useMainNav } from "../../orderlyConfig";
import { PathEnum } from "../../playground/constant";
import { useRouteContext } from "../orderlyProvider/rounteProvider";
import { useCustomRender } from "./useCustomRender";

type PortfolioLayoutProps = {
  children: ReactNode;
  currentPath?: PortfolioLeftSidebarPath;
};

export const PortfolioLayout: FC<PortfolioLayoutProps> = (props) => {
  const { onRouteChange } = useRouteContext();
  const mainNavProps = useMainNav();
  const bottomNavProps = useBottomNav();
  const customRender = useCustomRender();

  return (
    <PortfolioLayoutWidget
      footerProps={footerConfig}
      mainNavProps={{
        ...mainNavProps,
        initialMenu: PathEnum.Portfolio,
        customRender,
      }}
      bottomNavProps={bottomNavProps}
      routerAdapter={{
        onRouteChange,
      }}
      leftSideProps={{
        current: props.currentPath || PortfolioLeftSidebarPath.Overview,
        // Prediction menu labels need a slightly wider sidebar than the
        // scaffold default (185); keep this scoped to storybook so other
        // portfolio integrators are not forced into a new default width.
        maxWidth: 210,
      }}
    >
      {props.children}
    </PortfolioLayoutWidget>
  );
};
