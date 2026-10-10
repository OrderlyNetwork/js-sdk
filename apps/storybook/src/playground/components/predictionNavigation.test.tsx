import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Prediction } from "@orderly.network/prediction/src/prediction/prediction.ui";
import { PredictionWidget } from "@orderly.network/prediction/src/prediction/prediction.widget";

const mocks = vi.hoisted(() => ({
  route: vi.fn(),
  routeAvailable: true,
  script: vi.fn(),
  state: {
    defaultSymbol: "PERP_BTC5M2609291035_USDC",
    selectedRow: { symbol: "PERP_BTC5M2609291035_USDC" },
    selectMarketRound: vi.fn(),
    goToLiveRound: vi.fn(),
    goToNextRound: vi.fn(),
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
  usePredictionScript: mocks.script,
}));
vi.mock("@orderly.network/prediction/src/prediction/prediction.ui", () => ({
  Prediction: () => null,
}));
let root: ReactTestRenderer;
function ui() {
  return root.root.findByType(Prediction).props;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.routeAvailable = true;
  mocks.script.mockReturnValue(mocks.state);
});
afterEach(() => act(() => root?.unmount()));
it("reports the exact symbol object and reserves routing for cross-product selection", () => {
  const onSymbolChange = vi.fn();
  act(() => {
    root = create(
      <PredictionWidget
        symbol={mocks.state.selectedRow.symbol}
        onSymbolChange={onSymbolChange}
      />,
    );
  });
  ui().onSelectSymbol(mocks.state.selectedRow.symbol);
  expect(onSymbolChange).not.toHaveBeenCalled();
  ui().onSelectSymbol("PERP_ETH5M2609291035_USDC");
  expect(onSymbolChange).toHaveBeenCalledExactlyOnceWith({
    symbol: "PERP_ETH5M2609291035_USDC",
  });
  expect(mocks.route).not.toHaveBeenCalled();
  ui().onNavigatePerp({ symbol: "PERP/ETH?USDC" });
  expect(mocks.route).toHaveBeenCalledWith({
    href: "/perp/PERP%2FETH%3FUSDC",
    name: "perps",
  });
  expect(onSymbolChange).toHaveBeenCalledOnce();
});
it("encodes symbol navigation and forwards requested selection to the script", () => {
  act(() => {
    root = create(<PredictionWidget symbol={mocks.state.selectedRow.symbol} />);
  });
  ui().onSelectSymbol("ETH/5M?round=1");
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: "/prediction/ETH%2F5M%3Fround%3D1",
    name: "prediction",
  });
  const selection = mocks.script.mock.calls.at(-1)?.[3];
  expect(selection.symbol).toBe(mocks.state.selectedRow.symbol);
  expect(selection.onSymbolSelect).toBeTypeOf("function");
});
it("fills the default symbol URL once and resets the guard after leaving the default route", () => {
  act(() => {
    root = create(<PredictionWidget />);
  });
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: `/prediction/${mocks.state.selectedRow.symbol}`,
    name: "prediction",
    replace: true,
  });
  act(() => root.update(<PredictionWidget />));
  expect(mocks.route).toHaveBeenCalledOnce();
  act(() =>
    root.update(<PredictionWidget symbol={mocks.state.selectedRow.symbol} />),
  );
  act(() => root.update(<PredictionWidget />));
  expect(mocks.route).toHaveBeenCalledTimes(2);
});
it("does not fill a controlled URL and does not notify on parameter synchronization", () => {
  const onSymbolChange = vi.fn();
  act(() => {
    root = create(<PredictionWidget onSymbolChange={onSymbolChange} />);
  });
  act(() =>
    root.update(
      <PredictionWidget
        symbol="PERP_ETH5M2609291035_USDC"
        onSymbolChange={onSymbolChange}
      />,
    ),
  );
  expect(mocks.script.mock.calls.at(-1)?.[3].symbol).toBe(
    "PERP_ETH5M2609291035_USDC",
  );
  expect(mocks.route).not.toHaveBeenCalled();
  expect(onSymbolChange).not.toHaveBeenCalled();
});
it("keeps controlled selection without a router and disables all selection without a handler", () => {
  mocks.routeAvailable = false;
  const onSymbolChange = vi.fn();
  act(() => {
    root = create(
      <PredictionWidget
        symbol={mocks.state.selectedRow.symbol}
        onSymbolChange={onSymbolChange}
      />,
    );
  });
  expect(ui().onNavigatePerp).toBeUndefined();
  act(() =>
    root.update(<PredictionWidget symbol={mocks.state.selectedRow.symbol} />),
  );
  expect(ui().onSelectSymbol).toBeUndefined();
  const select = mocks.script.mock.calls.at(-1)?.[3].onSymbolSelect;
  expect(select).toBeTypeOf("function");
  select("PERP_ETH5M2609291035_USDC");
  expect(onSymbolChange).not.toHaveBeenCalled();
  expect(mocks.route).not.toHaveBeenCalled();
  ui().selectMarketRound(123);
  ui().goToLiveRound();
  expect(ui().goToNextRound()).toBe(false);
  expect(mocks.state.selectMarketRound).not.toHaveBeenCalled();
  expect(mocks.state.goToLiveRound).not.toHaveBeenCalled();
  expect(mocks.state.goToNextRound).not.toHaveBeenCalled();
});
