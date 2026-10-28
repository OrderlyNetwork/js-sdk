// @vitest-environment jsdom
import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import AppRoute from "../routes";

const mocks = vi.hoisted(() => ({
  createRouter: vi.fn((_routes: import("react-router").RouteObject[]) => ({})),
}));
vi.mock("react-router", async (importActual) => ({
  ...(await importActual<typeof import("react-router")>()),
  createBrowserRouter: mocks.createRouter,
  RouterProvider: () => null,
}));
vi.mock("@orderly.network/i18n", () => ({
  i18n: { language: "zh", changeLanguage: vi.fn() },
  parseI18nLang: () => "zh",
  getLocalePathFromPathname: (path: string) =>
    /^(\/en|\/zh)(\/|$)/.test(path) ? path.split("/")[1] : null,
}));
vi.mock("@orderly.network/ui", () => ({ Spinner: () => null }));
vi.mock("../components/layout", () => ({
  PortfolioLayout: () => null,
  TradingRewardsLayout: () => null,
}));
vi.mock("../components/orderlyProvider", () => ({
  OrderlyProvider: () => null,
}));
vi.mock("../perpSymbolStorage", () => ({
  getPerpSymbol: () => "PERP_BTC_USDC",
}));

it.each(["/prediction/BTC%2F5M", "/predict/BTC%2F5M"])(
  "normalizes %s and still mounts the router",
  (path) => {
    mocks.createRouter.mockClear();
    window.history.replaceState({}, "", `${path}?network=test#orders`);
    let root: ReturnType<typeof create>;
    act(() => {
      root = create(<AppRoute />);
    });
    expect(window.location.pathname).toBe("/zh/predict/BTC%2F5M");
    expect(window.location.search).toBe("?network=test");
    expect(window.location.hash).toBe("#orders");
    expect(mocks.createRouter).toHaveBeenCalledTimes(1);
    const routes = mocks.createRouter.mock
      .calls[0][0] as import("react-router").RouteObject[];
    const localeRoutes = routes[0].children!.find(
      (route) => route.path === ":lang",
    )!.children!;
    expect(localeRoutes.map((route) => route.path)).toEqual(
      expect.arrayContaining([
        "predict",
        "predict/:symbol",
        "prediction",
        "prediction/:symbol",
      ]),
    );
    act(() => root.unmount());
  },
);
