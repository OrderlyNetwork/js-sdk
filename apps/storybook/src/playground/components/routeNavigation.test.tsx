// @vitest-environment jsdom
import { useEffect } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useNav } from "../hooks/useNav";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), generatePath: vi.fn() }));
vi.mock("react-router", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("@orderly.network/i18n", () => ({
  generatePath: mocks.generatePath,
  getLocalePathFromPathname: (path: string) => path.split("/")[1],
}));
vi.mock("@orderly.network/portfolio", () => ({
  PortfolioLeftSidebarPath: { FeeTier: "/fee", ApiKey: "/api" },
}));
vi.mock("../perpSymbolStorage", () => ({
  getPerpSymbol: () => "PERP_ETH_USDC",
}));
let nav: ReturnType<typeof useNav>;
let root: ReactTestRenderer;
function Host() {
  const state = useNav();
  useEffect(() => {
    nav = state;
  }, [state]);
  return null;
}
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/en/markets");
  mocks.generatePath.mockImplementation(
    ({ path }) => `/zh${path}?networkId=testnet`,
  );
  act(() => {
    root = create(<Host />);
  });
});
afterEach(() => act(() => root.unmount()));
it("forwards replacement and keeps the language/query path returned by the host generator", () => {
  nav.onRouteChange({
    href: "/prediction/PERP_BTC5M_USDC",
    name: "prediction",
    replace: true,
  });
  expect(mocks.generatePath).toHaveBeenCalledWith({
    path: "/predict/PERP_BTC5M_USDC",
    locale: "en",
  });
  expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith(
    "/zh/predict/PERP_BTC5M_USDC?networkId=testnet",
    { replace: true },
  );
});
it("uses normal navigation for user selections and retains default Perp routing", () => {
  nav.onRouteChange({ href: "/perp/PERP_BTC_USDC", name: "perps" });
  expect(mocks.navigate).toHaveBeenLastCalledWith(
    "/zh/perp/PERP_BTC_USDC?networkId=testnet",
    { replace: undefined },
  );
  nav.onRouteChange({ href: "/", name: "perps", replace: true });
  expect(mocks.navigate).toHaveBeenLastCalledWith(
    "/zh/perp/PERP_ETH_USDC?networkId=testnet",
    { replace: true },
  );
});

it("keeps explicit query and hash suffixes on legacy requests", () => {
  mocks.generatePath.mockImplementation(
    ({ path, search }) => `/zh${path}${search ?? "?networkId=testnet"}`,
  );
  nav.onRouteChange({
    href: "/prediction/BTC%2F5M?network=main#orders",
    name: "legacy",
  });
  expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith(
    "/zh/predict/BTC%2F5M?network=main#orders",
    { replace: undefined },
  );
});
it("preserves the current hash when the destination omits it", () => {
  window.history.replaceState({}, "", "/en/markets#positions");
  nav.onRouteChange({ href: "/prediction", name: "legacy" });
  expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith(
    "/zh/predict?networkId=testnet#positions",
    { replace: undefined },
  );
});
it("keeps external links outside internal route resolution", () => {
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  nav.onRouteChange({
    href: "https://example.com/prediction",
    name: "external",
    target: "_blank",
  });
  expect(open).toHaveBeenCalledExactlyOnceWith(
    "https://example.com/prediction",
  );
  expect(mocks.navigate).not.toHaveBeenCalled();
  open.mockRestore();
});

it("uses the language of a direct localized URL", () => {
  window.history.replaceState({}, "", "/tc/predict?network=test#orders");
  mocks.generatePath.mockImplementation(
    ({ path, locale }) => `/${locale}${path}?network=test`,
  );
  nav.onRouteChange({
    href: "/prediction/BTC",
    name: "display",
  });
  expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith(
    "/tc/predict/BTC?network=test#orders",
    { replace: undefined },
  );
});
