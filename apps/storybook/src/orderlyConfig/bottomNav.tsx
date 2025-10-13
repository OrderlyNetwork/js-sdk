import { useMemo } from "react";
import { i18n, useTranslation } from "@kodiak-finance/orderly-i18n";
import {
  LeaderboardActiveIcon,
  LeaderboardInactiveIcon,
  MarketsActiveIcon,
  MarketsInactiveIcon,
  PortfolioActiveIcon,
  PortfolioInactiveIcon,
  TradingActiveIcon,
  TradingInactiveIcon,
} from "@kodiak-finance/orderly-ui";
import type { BottomNavProps } from "@kodiak-finance/orderly-ui-scaffold";

const getBottomNavProp = (): BottomNavProps => {
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
};

export const useBottomNav = () => {
  const { t } = useTranslation();
  return useMemo(() => getBottomNavProp(), [t]);
};
