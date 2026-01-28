import React, { ComponentType, lazy, Suspense } from "react";
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
import { Spinner } from "@orderly.network/ui";
import { PortfolioLayout, TradingRewardsLayout } from "./components/layout";
import { OrderlyProvider } from "./components/orderlyProvider";
import { PathEnum } from "./constant";
import { getSymbol } from "./storage";

// Loading fallback component
const PageLoading: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Spinner />
    </div>
  );
};

const lazyImportPage = (
  importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
): ComponentType<Record<string, unknown>> => {
  const LazyComponent = lazy(importFn);
  const WrappedComponent = (props: Record<string, unknown>) => (
    <Suspense fallback={<PageLoading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  return WrappedComponent;
};

// Lazy load page components
const AnnouncementPage = lazyImportPage(
  () => import("./pages/announcement/page"),
);
const LeaderboardPage = lazyImportPage(
  () => import("./pages/leaderboard/page"),
);
const MarketsPage = lazyImportPage(() => import("./pages/markets/page"));
const PerpPage = lazyImportPage(() => import("./pages/perp/page"));
const APIKeyPage = lazyImportPage(
  () => import("./pages/portfolio/api-key/page"),
);
const AssetsPage = lazyImportPage(
  () => import("./pages/portfolio/assets/page"),
);
const FeeTierPage = lazyImportPage(() => import("./pages/portfolio/fee/page"));
const HistoryPage = lazyImportPage(
  () => import("./pages/portfolio/history/page"),
);
const OrdersPage = lazyImportPage(
  () => import("./pages/portfolio/orders/page"),
);
const PortfolioPage = lazyImportPage(() => import("./pages/portfolio/page"));
const PositionsPage = lazyImportPage(
  () => import("./pages/portfolio/positions/page"),
);
const SettingsPage = React.lazy(() => import("./pages/portfolio/setting/page"));
const AffiliatePage = React.lazy(
  () => import("./pages/rewards/affiliate/page"),
);
const TradingRewardsPage = React.lazy(
  () => import("./pages/rewards/trading/page"),
);
const SwapPage = React.lazy(() => import("./pages/swap/page"));
const VaultsPage = React.lazy(() => import("./pages/vaults/page"));

const PointsPage = React.lazy(() => import("./pages/points/page"));

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
          element: <Navigate to={getSymbol()} />,
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
      path: "points",
      element: <PointsPage />,
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
              element: <Navigate to="perp" />,
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
