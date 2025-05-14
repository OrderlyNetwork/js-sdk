import { FC, ReactNode } from "react";
import {
  PortfolioLeftSidebarPath,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";
import { useNav } from "../../hooks/useNav";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";

type PortfolioLayoutProps = {
  children: ReactNode;
  currentPath?: PortfolioLeftSidebarPath;
};

export const PortfolioLayout: FC<PortfolioLayoutProps> = (props) => {
  const { onRouteChange } = useNav();
  const config = useOrderlyConfig();

  return (
    <PortfolioLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/portfolio",
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
