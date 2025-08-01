import { FC, ReactNode } from "react";
import {
  TradingRewardsLayoutWidget,
  TradingRewardsLeftSidebarPath,
} from "@orderly.network/trading-rewards";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { PathEnum } from "../../playground/constant";
import { useRouteContext } from "../orderlyProvider/rounteProvider";

type TradingRewardsLayoutProps = {
  children: ReactNode;
  currentPath?: TradingRewardsLeftSidebarPath;
};

export const TradingRewardsLayout: FC<TradingRewardsLayoutProps> = (props) => {
  const config = useOrderlyConfig();

  const { onRouteChange } = useRouteContext();

  return (
    <TradingRewardsLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: [PathEnum.Rewards],
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
