import { FC, ReactNode } from "react";
import { useNav } from "../../hooks/useNav";
import config from "../../config";
import {
  TradingRewardsLayoutWidget,
  TradingRewardsLeftSidebarPath,
} from "@orderly.network/trading-rewards";

type TradingRewardsLayoutProps = {
  children: ReactNode;
  currentPath?: TradingRewardsLeftSidebarPath;
};

export const TradingRewardsLayout: FC<TradingRewardsLayoutProps> = (props) => {
  const { onRouteChange } = useNav();
  return (
    <TradingRewardsLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/rewards",
      }}
      routerAdapter={{
        onRouteChange,
      }}
      leftSideProps={{
        current: props.currentPath || TradingRewardsLeftSidebarPath.Trading,
      }}
    >
      {props.children}
    </TradingRewardsLayoutWidget>
  );
};
