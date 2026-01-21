import React from "react";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from "react-router";
import {
  getLocalePathFromPathname,
  i18n,
  parseI18nLang,
} from "@orderly.network/i18n";
import { PortfolioLayout, TradingRewardsLayout } from "./components/layout";
import { OrderlyProvider } from "./components/orderlyProvider";
import { PathEnum } from "./constant";
import AnnouncementPage from "./pages/announcement/page";
import LeaderboardPage from "./pages/leaderboard/page";
import MarketsPage from "./pages/markets/page";
import PerpPage from "./pages/perp/page";
import APIKeyPage from "./pages/portfolio/api-key/page";
import AssetsPage from "./pages/portfolio/assets/page";
import FeeTierPage from "./pages/portfolio/fee/page";
import HistoryPage from "./pages/portfolio/history/page";
import OrdersPage from "./pages/portfolio/orders/page";
import PortfolioPage from "./pages/portfolio/page";
import PositionsPage from "./pages/portfolio/positions/page";
import SettingsPage from "./pages/portfolio/setting/page";
import AffiliatePage from "./pages/rewards/affiliate/page";
import TradingRewardsPage from "./pages/rewards/trading/page";
import SwapPage from "./pages/swap/page";
import VaultsPage from "./pages/vaults/page";
import { getSymbol } from "./storage";

const AppRoute: React.FC = () => {
  // console.log("browser language", i18n?.language);
  let currentLocale = parseI18nLang(i18n?.language);

  const pathname = window.location.pathname;
  const localePath = getLocalePathFromPathname(pathname);

  // TODO: use react router navigate instead of window.history.replaceState
  if (!localePath && pathname !== PathEnum.Root) {
    // redirect to the current locale path
    // /perp/PERP_ETH_USDC => /en/perp/PERP_ETH_USDC
    const redirectPath = `/${currentLocale}${pathname}`;
    window.history.replaceState({}, "", redirectPath);
    return;
  }

  if (localePath && localePath !== currentLocale) {
    currentLocale = localePath;
    i18n.changeLanguage(localePath);
  } else if (currentLocale !== i18n?.language) {
    i18n.changeLanguage(currentLocale);
  }

  const baseRoutes: RouteObject[] = [
    {
      path: "perp",
      children: [
        {
          index: true,
          element: (
            <Navigate
              // preserve the search parameters to ensure link device via url params works
              to={`${getSymbol()}${window.location.search}`}
            />
          ),
        },
        {
          path: ":symbol",
          element: <PerpPage />,
        },
      ],
    },
    {
      path: "portfolio",
      element: <PortfolioLayout />,
      children: [
        {
          index: true,
          element: <PortfolioPage />,
        },
        {
          path: "positions",
          element: <PositionsPage />,
        },
        {
          path: "orders",
          element: <OrdersPage />,
        },
        {
          path: "assets",
          element: <AssetsPage />,
        },
        {
          path: "fee",
          element: <FeeTierPage />,
        },
        {
          path: "api-key",
          element: <APIKeyPage />,
        },
        {
          path: "setting",
          element: <SettingsPage />,
        },
        {
          path: "history",
          element: <HistoryPage />,
        },
      ],
    },
    {
      path: "markets",
      element: <MarketsPage />,
    },
    {
      path: "vaults",
      element: <VaultsPage />,
    },
    {
      path: "leaderboard",
      element: <LeaderboardPage />,
    },
    {
      path: "rewards",
      element: <TradingRewardsLayout />,
      children: [
        {
          index: true,
          // /rewards => /rewards/affiliate
          element: <Navigate to={`affiliate${window.location.search}`} />,
        },
        {
          path: "trading",
          element: <TradingRewardsPage />,
        },
        {
          path: "affiliate",
          element: <AffiliatePage />,
        },
      ],
    },
    {
      path: "announcement",
      element: <AnnouncementPage />,
    },
    {
      path: "swap",
      element: <SwapPage />,
    },
  ];

  const router = createBrowserRouter([
    {
      path: "/",
      element: <OrderlyProvider />,
      children: [
        {
          index: true,
          element: (
            <Navigate
              // preserve the search parameters to ensure link device via url params works
              to={`/${currentLocale}${PathEnum.Perp}/${getSymbol()}${window.location.search}`}
            />
          ),
        },
        // {
        //   path: "markets",
        //   element: <Navigate to={`/${currentLocale}${PathEnum.Markets}`} />,
        // },
        {
          path: ":lang",
          children: [
            {
              index: true,
              element: <Navigate to={`perp${window.location.search}`} />,
            },
            ...baseRoutes,
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRoute;
