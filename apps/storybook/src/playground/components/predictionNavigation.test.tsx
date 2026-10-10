import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Prediction } from "@orderly.network/prediction/src/prediction/prediction.ui";
import {
  PredictionWidget,
  type PredictionWidgetProps,
} from "@orderly.network/prediction/src/prediction/prediction.widget";

const mocks = vi.hoisted(() => ({
  route: vi.fn(),
  routeAvailable: true,
  state: {
    marketId: "PERP_BTC5M_USDC",
    markets: [{ id: "PERP_BTC5M_USDC" }, { id: "PERP_ETH5M_USDC" }],
    selectMarket: vi.fn(),
    isRegionRestricted: false,
  },
}));
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({
    onRouteChange: mocks.routeAvailable ? mocks.route : undefined,
  }),
  useCanTrade: () => false,
}));
vi.mock("@orderly.network/trading-common", () => ({
  AssetViewWidget: () => null,
  useFirstTimeDeposit: () => false,
}));
vi.mock("@orderly.network/prediction/src/prediction/prediction.script", () => ({
  usePredictionScript: () => mocks.state,
}));
vi.mock("@orderly.network/prediction/src/prediction/prediction.ui", () => ({
  Prediction: () => null,
}));
let root: ReactTestRenderer;
function mount(
  props: PredictionWidgetProps = { marketId: mocks.state.marketId },
) {
  act(() => {
    root = create(<PredictionWidget {...props} />);
  });
}
function ui() {
  return root.root.findByType(Prediction).props;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.routeAvailable = true;
  mocks.state.marketId = "PERP_BTC5M_USDC";
  mocks.state.markets = [{ id: "PERP_BTC5M_USDC" }, { id: "PERP_ETH5M_USDC" }];
});
afterEach(() => act(() => root?.unmount()));
it("uses the controlled market object, ignores repeated selection, and only routes cross-product selection", () => {
  const onSymbolChange = vi.fn();
  mount({ marketId: mocks.state.marketId, onSymbolChange });
  ui().onSelectMarket(mocks.state.marketId);
  expect(onSymbolChange).not.toHaveBeenCalled();
  ui().onSelectMarket("PERP_ETH5M_USDC");
  expect(onSymbolChange).toHaveBeenCalledExactlyOnceWith({
    marketId: "PERP_ETH5M_USDC",
  });
  expect(mocks.route).not.toHaveBeenCalled();
  ui().onNavigatePerp({ symbol: "PERP/ETH?USDC" });
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: "/perp/PERP%2FETH%3FUSDC",
    name: "perps",
  });
  expect(onSymbolChange).toHaveBeenCalledOnce();
});
it("routes a different Prediction market by default with an encoded ID", () => {
  mount();
  ui().onSelectMarket(mocks.state.marketId);
  expect(mocks.route).not.toHaveBeenCalled();
  ui().onSelectMarket("ETH/5M?round=1");
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: "/prediction/ETH%2F5M%3Fround%3D1",
    name: "prediction",
  });
});
it("fills the default URL once with replacement and fills it again after returning from a market URL", () => {
  mount({});
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: "/prediction/PERP_BTC5M_USDC",
    name: "prediction",
    replace: true,
  });
  act(() => root.update(<PredictionWidget />));
  expect(mocks.route).toHaveBeenCalledOnce();
  act(() => root.update(<PredictionWidget marketId={mocks.state.marketId} />));
  act(() => root.update(<PredictionWidget />));
  expect(mocks.route).toHaveBeenCalledTimes(2);
});
it("waits for metadata before filling the default URL", () => {
  mocks.state.markets = [];
  mount({});
  expect(mocks.route).not.toHaveBeenCalled();
  mocks.state.markets = [{ id: mocks.state.marketId }];
  act(() => root.update(<PredictionWidget />));
  expect(mocks.route).toHaveBeenCalledOnce();
});
it("does not fill a controlled URL or notify on initialization, URL synchronization, and state refresh", () => {
  const onSymbolChange = vi.fn();
  mount({ onSymbolChange });
  expect(mocks.route).not.toHaveBeenCalled();
  expect(onSymbolChange).not.toHaveBeenCalled();
  act(() =>
    root.update(
      <PredictionWidget
        marketId="PERP_ETH5M_USDC"
        onSymbolChange={onSymbolChange}
      />,
    ),
  );
  expect(mocks.state.selectMarket).toHaveBeenCalledWith("PERP_ETH5M_USDC");
  mocks.state.marketId = "PERP_ETH5M_USDC";
  act(() =>
    root.update(
      <PredictionWidget
        marketId="PERP_ETH5M_USDC"
        onSymbolChange={onSymbolChange}
      />,
    ),
  );
  act(() =>
    root.update(
      <PredictionWidget
        marketId="PERP_BTC5M_USDC"
        onSymbolChange={onSymbolChange}
      />,
    ),
  );
  expect(mocks.state.selectMarket).toHaveBeenLastCalledWith("PERP_BTC5M_USDC");
  expect(onSymbolChange).not.toHaveBeenCalled();
  expect(mocks.route).not.toHaveBeenCalled();
});
it("retains unknown URL IDs without silently changing the market or redirecting", () => {
  mount({ marketId: "UNKNOWN" });
  expect(ui().requestedMarketId).toBe("UNKNOWN");
  expect(mocks.state.selectMarket).not.toHaveBeenCalled();
  expect(mocks.route).not.toHaveBeenCalled();
});
it("keeps controlled selection without a router and disables cross-product navigation", () => {
  mocks.routeAvailable = false;
  const onSymbolChange = vi.fn();
  mount({ marketId: mocks.state.marketId, onSymbolChange });
  expect(ui().onNavigatePerp).toBeUndefined();
  ui().onSelectMarket("PERP_ETH5M_USDC");
  expect(onSymbolChange).toHaveBeenCalledWith({ marketId: "PERP_ETH5M_USDC" });
  act(() => root.update(<PredictionWidget marketId={mocks.state.marketId} />));
  expect(ui().onSelectMarket).toBeUndefined();
  expect(ui().onNavigatePerp).toBeUndefined();
  expect(mocks.route).not.toHaveBeenCalled();
});
