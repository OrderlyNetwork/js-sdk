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
  StarChildChatIcon,
  StarChildChatInactiveIcon,
} from "@orderly.network/ui";
import type { BottomNavProps } from "@orderly.network/ui-scaffold";

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
        name: "AI",
        href: "",
        activeIcon: <StarChildChatIcon />,
        inactiveIcon: <StarChildChatInactiveIcon />,
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
