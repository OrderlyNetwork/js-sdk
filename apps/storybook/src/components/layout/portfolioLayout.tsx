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
      }}
    >
      {props.children}
    </PortfolioLayoutWidget>
  );
};
