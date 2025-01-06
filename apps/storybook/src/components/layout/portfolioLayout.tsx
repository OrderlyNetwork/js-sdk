import { FC, ReactNode } from "react";
import {
  PortfolioLeftSidebarPath,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";
import { useNav } from "../../hooks/useNav";
import config from "../../config";

type PortfolioLayoutProps = {
  children: ReactNode;
  currentPath?: PortfolioLeftSidebarPath;
};

export const PortfolioLayout: FC<PortfolioLayoutProps> = (props) => {
  const { onRouteChange } = useNav();
  return (
    <PortfolioLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/portfolio",
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
