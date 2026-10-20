import { useEffect } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useNav } from "../hooks/useNav";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), generatePath: vi.fn() }));
vi.mock("react-router", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("@orderly.network/i18n", () => ({ generatePath: mocks.generatePath }));
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
    path: "/prediction/PERP_BTC5M_USDC",
  });
  expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith(
    "/zh/prediction/PERP_BTC5M_USDC?networkId=testnet",
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
