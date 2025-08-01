import { Outlet } from "react-router";
import { TradingRewardsLeftSidebarPath } from "@orderly.network/trading-rewards";
import { TradingRewardsLayout as CommonTradingRewardsLayout } from "../../../components/layout";
import { usePathWithoutLang } from "../../hooks/usePathWithoutLang";

export const TradingRewardsLayout = () => {
  const path = usePathWithoutLang();

  return (
    <CommonTradingRewardsLayout
      currentPath={path as TradingRewardsLeftSidebarPath}
    >
      {/* because the portfolio layout is used in route layout, we need to render the outlet */}
      <Outlet />
    </CommonTradingRewardsLayout>
  );
};
