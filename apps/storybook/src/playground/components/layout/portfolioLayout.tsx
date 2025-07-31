import { useMemo } from "react";
import { Outlet } from "react-router";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import { CommonPortfolioLayout } from "../../../components/layout";
import { PathEnum } from "../../constant";
import { useNav } from "../../hooks/useNav";
import { usePathWithoutLang } from "../../hooks/usePathWithoutLang";

export const PortfolioLayout = () => {
  const path = usePathWithoutLang();

  const { onRouteChange } = useNav();

  const currentPath = useMemo(() => {
    if (path.endsWith(PathEnum.FeeTier))
      return PortfolioLeftSidebarPath.FeeTier;

    if (path.endsWith(PathEnum.ApiKey)) return PortfolioLeftSidebarPath.ApiKey;

    return path;
  }, [path]);

  return (
    <CommonPortfolioLayout
      currentPath={currentPath as PortfolioLeftSidebarPath}
      onRouteChange={onRouteChange}
    >
      {/* because the portfolio layout is used in route layout, we need to render the outlet */}
      <Outlet />
    </CommonPortfolioLayout>
  );
};
