import { useCallback } from "react";
// https://github.com/storybookjs/storybook/tree/next/code/addons/links
// linkTo is not working, so use navigate instead
import { navigate } from "@storybook/addon-links";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import { TradingRewardsLeftSidebarPath } from "@orderly.network/trading-rewards";
import { RouteOption } from "@orderly.network/ui-scaffold";

export enum RoutePath {
  Root = "/",
  Portfolio = "/portfolio",
  Markets = "/markets",
  TradingRewards = "/rewards",
  TradingLeaderboard = "/leaderboard",
}

const name = "Layout Page";

const routeMap = {
  [RoutePath.Root]: { storyId: "Package/trading/TradingPage", name: "Page" },
  [PortfolioLeftSidebarPath.Overview]: "Package/portfolio/Overview",
  [PortfolioLeftSidebarPath.FeeTier]: "Package/portfolio/FeeTier",
  [PortfolioLeftSidebarPath.ApiKey]: "Package/portfolio/ApiKey",
  [PortfolioLeftSidebarPath.Positions]: "Package/portfolio/Positions",
  [PortfolioLeftSidebarPath.Orders]: "Package/portfolio/Orders",
  [PortfolioLeftSidebarPath.Assets]: "Package/portfolio/Assets",
  [PortfolioLeftSidebarPath.Setting]: "Package/portfolio/Setting",
  [PortfolioLeftSidebarPath.History]: "Package/portfolio/History",
  [RoutePath.TradingRewards]: "Package/trading-rewards",
  [TradingRewardsLeftSidebarPath.Trading]: "Package/trading-rewards",
  [TradingRewardsLeftSidebarPath.Affiliate]: "Package/affiliate/Dashboard",
  [RoutePath.Markets]: "Package/markets/HomePage",
  [RoutePath.TradingLeaderboard]: "Package/trading-leaderboard",
} as Record<string, { storyId: string; name?: string } | string>;

export function useNav() {
  const onRouteChange = useCallback((option: RouteOption) => {
    if (option.target === "_blank") {
      window.open(option.href);
      return;
    }
    const params = routeMap[option.href];
    navigate(typeof params === "string" ? { storyId: params, name } : params);
  }, []);

  return { onRouteChange };
}
