import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { deriveBinaryMarkets } from "@orderly.network/prediction/src/prediction/binary/binaryMarkets";
import { Prediction } from "@orderly.network/prediction/src/prediction/prediction.ui";
import { PredictionWidget } from "@orderly.network/prediction/src/prediction/prediction.widget";
import { PredictionMarketPanelWidget } from "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui";

const mocks = vi.hoisted(() => ({ route: vi.fn(), storageWrites: vi.fn() }));
const now = Date.UTC(2026, 8, 29, 10, 36);
const history: BinaryInfoRow = {
  symbol: "PERP_BTC5M2609291030_USDC",
  product_type: "BINARY",
  status: "ACTIVE",
  activated_at: now - 420_000,
  observation_start_at: now - 360_000,
  expire_at: now - 60_000,
  index_price_symbol: "PERP_BTC_USDC",
  fee_model: "BINARY_PROBABILITY",
  s0: null,
};
const live = {
  ...history,
  symbol: "PERP_BTC5M2609291035_USDC",
  observation_start_at: now - 60_000,
  expire_at: now + 240_000,
};
const eth = {
  ...live,
  symbol: "PERP_ETH5M2609291035_USDC",
  index_price_symbol: "PERP_ETH_USDC",
};
const rows = [history, live, eth];
const storageKey = "orderly_prediction_selected_market";
let storage: Map<string, string>;
vi.mock("@orderly.network/hooks", async () => {
  const { useLocalStorage } =
    await import("@orderly.network/hooks/src/useLocalStorage");
  return { useLocalStorage, useQuery: () => ({ data: undefined }) };
});
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({ onRouteChange: mocks.route }),
  useCanTrade: () => false,
}));
vi.mock("@orderly.network/trading-common", () => ({
  AssetViewWidget: () => null,
  useFirstTimeDeposit: () => false,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionMarkets",
  () => ({
    usePredictionMarkets: () => ({
      rows,
      markets: deriveBinaryMarkets(rows, now),
      isLoading: false,
    }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/prediction.script",
  async () => {
    const { useBinaryRounds } =
      await import("@orderly.network/prediction/src/prediction/binary/useBinaryRounds");
    return {
      usePredictionScript: () => ({
        ...useBinaryRounds({ active: true }),
        isRegionRestricted: false,
      }),
    };
  },
);
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionFavorites",
  () => ({
    usePredictionFavorites: () => ({
      favoriteMarketIds: ["PERP_ETH5M_USDC"],
      toggleFavorite: vi.fn(),
    }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui",
  () => ({
    usePredictionMarketTabs: () => [],
    PredictionMarketPanelWidget: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/prediction.ui",
  async () => {
    const { usePredictionMarketsDropdown } =
      await import("@orderly.network/prediction/src/prediction/usePredictionMarketsDropdown");
    return {
      Prediction: (props: { onSelectMarket?: (id: string) => void }) => {
        const extension = usePredictionMarketsDropdown(props.onSelectMarket);
        return extension.renderTabContent?.(
          { id: "prediction", name: "Prediction", match: () => false },
          "prediction",
          () => {},
        );
      },
    };
  },
);
let root: ReactTestRenderer;
function state() {
  return root.root.findByType(Prediction).props;
}
function selectEth() {
  act(() =>
    root.root
      .findByType(PredictionMarketPanelWidget)
      .props.onSelect("PERP_ETH5M_USDC"),
  );
}
function mount(onSymbolChange?: (market: { marketId: string }) => void) {
  act(() => {
    root = create(
      <PredictionWidget
        marketId="PERP_BTC5M_USDC"
        onSymbolChange={onSymbolChange}
      />,
    );
  });
  act(() => state().selectMarketRound(history.observation_start_at / 1000));
  expect(state().selectedRow.symbol).toBe(history.symbol);
  mocks.storageWrites.mockClear();
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(now);
  storage = new Map([[storageKey, JSON.stringify("PERP_BTC5M_USDC")]]);
  const window = Object.assign(new EventTarget(), {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        mocks.storageWrites(key, value);
        storage.set(key, value);
      },
    },
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  });
  vi.stubGlobal("window", window);
});
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("keeps the selected historical round and storage when the host rejects a selection", () => {
  const onSymbolChange = vi.fn();
  mount(onSymbolChange);
  selectEth();
  expect(onSymbolChange).toHaveBeenCalledExactlyOnceWith({
    marketId: "PERP_ETH5M_USDC",
  });
  expect(state().marketId).toBe("PERP_BTC5M_USDC");
  expect(state().selectedRow.symbol).toBe(history.symbol);
  expect(mocks.storageWrites).not.toHaveBeenCalled();
  expect(mocks.route).not.toHaveBeenCalled();
});
it("persists the accepted market once and resets the historical round only after the host updates marketId", () => {
  const onSymbolChange = vi.fn();
  mount(onSymbolChange);
  selectEth();
  expect(state().selectedRow.symbol).toBe(history.symbol);
  expect(mocks.storageWrites).not.toHaveBeenCalled();
  act(() => {
    root.update(
      <PredictionWidget
        marketId="PERP_ETH5M_USDC"
        onSymbolChange={onSymbolChange}
      />,
    );
  });
  expect(state().selectedRow.symbol).toBe(eth.symbol);
  expect(mocks.storageWrites).toHaveBeenCalledExactlyOnceWith(
    storageKey,
    JSON.stringify("PERP_ETH5M_USDC"),
  );
  act(() => {
    root.update(
      <PredictionWidget
        marketId="PERP_BTC5M_USDC"
        onSymbolChange={onSymbolChange}
      />,
    );
  });
  expect(state().selectedRow.symbol).toBe(live.symbol);
  expect(onSymbolChange).toHaveBeenCalledOnce();
});
it("requests navigation without mutating selection until the new URL marketId arrives", () => {
  mount();
  selectEth();
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: "/prediction/PERP_ETH5M_USDC",
    name: "prediction",
  });
  expect(state().selectedRow.symbol).toBe(history.symbol);
  expect(mocks.storageWrites).not.toHaveBeenCalled();
  act(() => {
    root.update(<PredictionWidget marketId="PERP_ETH5M_USDC" />);
  });
  expect(state().selectedRow.symbol).toBe(eth.symbol);
  expect(mocks.storageWrites).toHaveBeenCalledExactlyOnceWith(
    storageKey,
    JSON.stringify("PERP_ETH5M_USDC"),
  );
});
