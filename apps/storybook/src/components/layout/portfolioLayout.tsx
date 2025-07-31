import { FC, ReactNode } from "react";
import {
  PortfolioLeftSidebarPath,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";
import { RouteOption } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { PathEnum } from "../../playground/constant";
import { useRouteContext } from "../orderlyProvider/rounteProvider";

type PortfolioLayoutProps = {
  children: ReactNode;
  currentPath?: PortfolioLeftSidebarPath;
};

export const PortfolioLayout: FC<PortfolioLayoutProps> = (props) => {
  const config = useOrderlyConfig();
  const { onRouteChange } = useRouteContext();

  return (
    <PortfolioLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: PathEnum.Portfolio,
      }}
      bottomNavProps={{
        ...config.scaffold.bottomNavProps,
      }}
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
