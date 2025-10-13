import { FC, ReactNode } from "react";
import {
  TradingRewardsLayoutWidget,
  TradingRewardsLeftSidebarPath,
} from "@kodiak-finance/orderly-trading-rewards";
import { footerConfig, useMainNav } from "../../orderlyConfig";
import { PathEnum } from "../../playground/constant";
import { useRouteContext } from "../orderlyProvider/rounteProvider";

type TradingRewardsLayoutProps = {
  children: ReactNode;
  currentPath?: TradingRewardsLeftSidebarPath;
};

export const TradingRewardsLayout: FC<TradingRewardsLayoutProps> = (props) => {
  const mainNavProps = useMainNav();

  const { onRouteChange } = useRouteContext();

  return (
    <TradingRewardsLayoutWidget
      footerProps={footerConfig}
      mainNavProps={{
        ...mainNavProps,
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
