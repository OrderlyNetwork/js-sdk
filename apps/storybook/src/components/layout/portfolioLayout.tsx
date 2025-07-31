import { FC, ReactNode } from "react";
import {
  PortfolioLeftSidebarPath,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";
import { RouteOption } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { onStorybookRounteChange } from "../../hooks/useStorybookNav";

type PortfolioLayoutProps = {
  children: ReactNode;
  currentPath?: PortfolioLeftSidebarPath;
};

export const PortfolioLayout: FC<PortfolioLayoutProps> = (props) => {
  return (
    <CommonPortfolioLayout onRouteChange={onStorybookRounteChange}>
      {props.children}
    </CommonPortfolioLayout>
  );
};

type CommonPortfolioLayoutProps = PortfolioLayoutProps & {
  onRouteChange: (option: RouteOption) => void;
};

export const CommonPortfolioLayout: FC<CommonPortfolioLayoutProps> = (
  props,
) => {
  const config = useOrderlyConfig({ onRouteChange: props.onRouteChange });

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
        onRouteChange: props.onRouteChange,
      }}
      leftSideProps={{
        current: props.currentPath || PortfolioLeftSidebarPath.Overview,
      }}
    >
      {props.children}
    </PortfolioLayoutWidget>
  );
};
