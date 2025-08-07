import { useMemo } from "react";
import { i18n, useTranslation } from "@orderly.network/i18n";
import {
  TradingActiveIcon,
  TradingInactiveIcon,
  PortfolioActiveIcon,
  PortfolioInactiveIcon,
  LeaderboardActiveIcon,
  LeaderboardInactiveIcon,
  MarketsActiveIcon,
  MarketsInactiveIcon,
} from "@orderly.network/ui";
import { BottomNavProps } from "@orderly.network/ui-scaffold";

export function useBottomNav() {
  const { t } = useTranslation();
  return useMemo(() => getBottomNavProp(), [t]);
}

function getBottomNavProp(): BottomNavProps {
  return {
    mainMenus: [
      {
        name: i18n.t("common.markets"),
        href: "/markets",
        activeIcon: <MarketsActiveIcon />,
        inactiveIcon: <MarketsInactiveIcon />,
      },
      {
        name: i18n.t("common.trading"),
        href: "/",
        activeIcon: <TradingActiveIcon />,
        inactiveIcon: <TradingInactiveIcon />,
      },
      {
        name: i18n.t("tradingLeaderboard.arena"),
        href: "/leaderboard",
        activeIcon: <LeaderboardActiveIcon />,
        inactiveIcon: <LeaderboardInactiveIcon />,
      },
      {
        name: i18n.t("common.portfolio"),
        href: "/portfolio",
        activeIcon: <PortfolioActiveIcon />,
        inactiveIcon: <PortfolioInactiveIcon />,
      },
    ],
  };
}
