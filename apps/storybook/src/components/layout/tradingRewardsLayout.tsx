import { FC, ReactNode } from "react";
import {
  TradingRewardsLayoutWidget,
  TradingRewardsLeftSidebarPath,
} from "@orderly.network/trading-rewards";
import { RouteOption } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { onStorybookRounteChange } from "../../hooks/useStorybookNav";

type TradingRewardsLayoutProps = {
  children: ReactNode;
  currentPath?: TradingRewardsLeftSidebarPath;
};

export const TradingRewardsLayout: FC<TradingRewardsLayoutProps> = (props) => {
  return (
    <CommonTradingRewardsLayout onRouteChange={onStorybookRounteChange}>
      {props.children}
    </CommonTradingRewardsLayout>
  );
};

type CommonTradingRewardsLayoutProps = TradingRewardsLayoutProps & {
  onRouteChange: (option: RouteOption) => void;
};

export const CommonTradingRewardsLayout: FC<CommonTradingRewardsLayoutProps> = (
  props,
) => {
  const config = useOrderlyConfig({ onRouteChange: props.onRouteChange });

  return (
    <TradingRewardsLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: ["/rewards"],
      }}
      routerAdapter={{
        onRouteChange: props.onRouteChange,
      }}
      leftSideProps={{
        current: props.currentPath || TradingRewardsLeftSidebarPath.Trading,
      }}
    >
      {props.children}
    </TradingRewardsLayoutWidget>
  );
};
