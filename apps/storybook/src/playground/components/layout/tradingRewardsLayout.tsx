import { Outlet } from "react-router";
import { TradingRewardsLeftSidebarPath } from "@orderly.network/trading-rewards";
import { CommonTradingRewardsLayout } from "../../../components/layout";
import { useNav } from "../../hooks/useNav";
import { usePathWithoutLang } from "../../hooks/usePathWithoutLang";

export const TradingRewardsLayout = () => {
  const path = usePathWithoutLang();

  const { onRouteChange } = useNav();

  return (
    <CommonTradingRewardsLayout
      onRouteChange={onRouteChange}
      currentPath={path as TradingRewardsLeftSidebarPath}
    >
      <Outlet />
    </CommonTradingRewardsLayout>
  );
};
