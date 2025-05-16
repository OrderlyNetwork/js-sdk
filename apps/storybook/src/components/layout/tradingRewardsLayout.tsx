import { FC, ReactNode } from "react";
import {
  TradingRewardsLayoutWidget,
  TradingRewardsLeftSidebarPath,
} from "@orderly.network/trading-rewards";
import { useNav } from "../../hooks/useNav";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";

type TradingRewardsLayoutProps = {
  children: ReactNode;
  currentPath?: TradingRewardsLeftSidebarPath;
};

export const TradingRewardsLayout: FC<TradingRewardsLayoutProps> = (props) => {
  const { onRouteChange } = useNav();
  const config = useOrderlyConfig();

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
