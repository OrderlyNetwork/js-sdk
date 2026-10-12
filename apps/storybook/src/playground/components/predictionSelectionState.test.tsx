import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { deriveBinaryMarkets } from "@orderly.network/prediction/src/prediction/binary/binaryMarkets";
import { Prediction } from "@orderly.network/prediction/src/prediction/prediction.ui";
import { PredictionWidget } from "@orderly.network/prediction/src/prediction/prediction.widget";
import { PredictionMarketPanelWidget } from "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui";

const mocks = vi.hoisted(() => ({
  route: vi.fn(),
  routeEnabled: true,
  storageWrites: vi.fn(),
  query: vi.fn(),
}));
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
let snapshotRows = rows;
const storageKey = "orderly_prediction_selected_market";
let storage: Map<string, string>;
vi.mock("@orderly.network/hooks", async () => {
  const { useLocalStorage } =
    await import("@orderly.network/hooks/src/useLocalStorage");
  return { useLocalStorage, useQuery: mocks.query };
});
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({
    onRouteChange: mocks.routeEnabled ? mocks.route : undefined,
  }),
  useCanTrade: () => false,
}));
vi.mock("@orderly.network/trading-shared", () => ({
  AssetViewWidget: () => null,
  useFirstTimeDeposit: () => false,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionMarkets",
  () => ({
    usePredictionMarkets: () => ({
      rows: snapshotRows,
      markets: deriveBinaryMarkets(snapshotRows, Date.now()),
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
      usePredictionScript: (
        _restricted: boolean,
        _active: boolean,
        _live: boolean,
        selection: {
          symbol?: string;
          onSymbolSelect: (symbol: string) => void;
        },
      ) => ({
        ...useBinaryRounds({ active: true, ...selection }),
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
      Prediction: (props: { onSelectSymbol?: (symbol: string) => void }) => {
        const extension = usePredictionMarketsDropdown(props.onSelectSymbol);
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
      .props.onSelect(eth.symbol),
  );
}
function mount(onSymbolChange?: (selection: { symbol: string }) => void) {
  act(() => {
    root = create(
      <PredictionWidget symbol={live.symbol} onSymbolChange={onSymbolChange} />,
    );
  });
  act(() =>
    root.update(
      <PredictionWidget
        symbol={history.symbol}
        onSymbolChange={onSymbolChange}
      />,
    ),
  );
  expect(state().selectedRow.symbol).toBe(history.symbol);
  mocks.storageWrites.mockClear();
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.routeEnabled = true;
  snapshotRows = rows;
  mocks.query.mockReturnValue({ data: undefined, isLoading: false });
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
    symbol: eth.symbol,
  });
  expect(state().marketId).toBe("PERP_BTC5M_USDC");
  expect(state().selectedRow.symbol).toBe(history.symbol);
  expect(mocks.storageWrites).not.toHaveBeenCalled();
  expect(mocks.route).not.toHaveBeenCalled();
});
it("persists the accepted market once and resets the historical round only after the host updates symbol", () => {
  const onSymbolChange = vi.fn();
  mount(onSymbolChange);
  selectEth();
  expect(state().selectedRow.symbol).toBe(history.symbol);
  expect(mocks.storageWrites).not.toHaveBeenCalled();
  act(() => {
    root.update(
      <PredictionWidget symbol={eth.symbol} onSymbolChange={onSymbolChange} />,
    );
  });
  expect(state().selectedRow.symbol).toBe(eth.symbol);
  expect(mocks.storageWrites).toHaveBeenCalledExactlyOnceWith(
    storageKey,
    JSON.stringify("PERP_ETH5M_USDC"),
  );
  act(() => {
    root.update(
      <PredictionWidget symbol={live.symbol} onSymbolChange={onSymbolChange} />,
    );
  });
  expect(state().selectedRow.symbol).toBe(live.symbol);
  expect(onSymbolChange).toHaveBeenCalledOnce();
});
it("requests navigation without mutating selection until the new URL symbol arrives", () => {
  mount();
  selectEth();
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: `/prediction/${eth.symbol}`,
    name: "prediction",
  });
  expect(state().selectedRow.symbol).toBe(history.symbol);
  expect(mocks.storageWrites).not.toHaveBeenCalled();
  act(() => {
    root.update(<PredictionWidget symbol={eth.symbol} />);
  });
  expect(state().selectedRow.symbol).toBe(eth.symbol);
  expect(mocks.storageWrites).toHaveBeenCalledExactlyOnceWith(
    storageKey,
    JSON.stringify("PERP_ETH5M_USDC"),
  );
});

it("restores a history symbol from details when it is absent from the snapshot", () => {
  snapshotRows = [live, eth];
  mocks.query.mockImplementation((key: string | null) => ({
    data: key?.endsWith(history.symbol) ? history : undefined,
  }));
  act(() => {
    root = create(<PredictionWidget symbol={history.symbol} />);
  });
  expect(state().selectedRow.symbol).toBe(history.symbol);
  expect(state().isRoundInSnapshot).toBe(false);
  expect(state().isRoundTradable).toBe(false);
  expect(mocks.query).toHaveBeenCalledWith(
    `/v1/public/binary/info/${history.symbol}`,
    expect.any(Object),
  );
  expect(mocks.route).not.toHaveBeenCalled();
});
it("keeps the exact round after expiry and snapshot removal", () => {
  act(() => {
    root = create(<PredictionWidget symbol={live.symbol} />);
  });
  act(() => {
    vi.advanceTimersByTime(300_000);
  });
  const next = {
    ...live,
    symbol: "PERP_BTC5M2609291040_USDC",
    observation_start_at: now + 240_000,
    expire_at: now + 540_000,
  };
  snapshotRows = [next, eth];
  act(() => root.update(<PredictionWidget symbol={live.symbol} />));
  expect(state().selectedRow.symbol).toBe(live.symbol);
  expect(state().isRoundInSnapshot).toBe(false);
  expect(state().isRoundTradable).toBe(false);
  expect(mocks.route).not.toHaveBeenCalled();
  act(() => state().goToLiveRound());
  expect(mocks.route).toHaveBeenCalledWith({
    href: `/prediction/${next.symbol}`,
    name: "prediction",
  });
  expect(state().selectedRow.symbol).toBe(live.symbol);
});
it.each(["UNKNOWN", "PERP_BTC5M_USDC", "PERP_BTC5M2602301200_USDC"])(
  "does not fall back or query invalid symbol %s",
  (symbol) => {
    act(() => {
      root = create(<PredictionWidget symbol={symbol} />);
    });
    expect(state().selectedRow).toBeUndefined();
    expect(state().isRoundTradable).toBe(false);
    expect(mocks.query.mock.calls.every(([key]) => key === null)).toBe(true);
    expect(mocks.route).not.toHaveBeenCalled();
  },
);
it("does not use stale or mismatched details while the target symbol is loading or unavailable", () => {
  snapshotRows = [live, eth];
  mocks.query.mockReturnValue({ data: eth, isLoading: true });
  act(() => {
    root = create(<PredictionWidget symbol={history.symbol} />);
  });
  expect(state().selectedRow).toBeUndefined();
  expect(state().isRoundTradable).toBe(false);
  mocks.query.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: new Error("missing"),
  });
  act(() => root.update(<PredictionWidget symbol={history.symbol} />));
  expect(state().selectedRow).toBeUndefined();
  expect(mocks.route).not.toHaveBeenCalled();
});
it("reports chart and next-round selections without changing the accepted contract", () => {
  const onSymbolChange = vi.fn();
  mount(onSymbolChange);
  act(() => state().selectMarketRound(live.observation_start_at / 1000));
  expect(onSymbolChange).toHaveBeenCalledWith({ symbol: live.symbol });
  act(() => state().goToNextRound());
  expect(onSymbolChange).toHaveBeenCalledTimes(2);
  expect(state().selectedRow.symbol).toBe(history.symbol);
  expect(mocks.storageWrites).not.toHaveBeenCalled();
});

it("waits for initial metadata before replacing the default URL with a real symbol", () => {
  snapshotRows = [];
  act(() => {
    root = create(<PredictionWidget />);
  });
  expect(state().selectedRow).toBeUndefined();
  expect(mocks.route).not.toHaveBeenCalled();
  snapshotRows = rows;
  act(() => root.update(<PredictionWidget />));
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: `/prediction/${live.symbol}`,
    name: "prediction",
    replace: true,
  });
});

const nextRound = {
  ...live,
  symbol: "PERP_BTC5M2609291040_USDC",
  observation_start_at: now + 240_000,
  expire_at: now + 540_000,
};

it("pins the initial default round through expiry and snapshot removal in controlled integration", () => {
  const onSymbolChange = vi.fn();
  snapshotRows = [history, live, nextRound, eth];
  act(() => {
    root = create(<PredictionWidget onSymbolChange={onSymbolChange} />);
  });
  expect(state().selectedRow.symbol).toBe(live.symbol);
  act(() => {
    vi.advanceTimersByTime(240_010);
  });
  expect(state().selectedRow.symbol).toBe(live.symbol);
  expect(state().isRoundTradable).toBe(false);
  snapshotRows = [nextRound];
  act(() => root.update(<PredictionWidget onSymbolChange={onSymbolChange} />));
  expect(state().selectedRow.symbol).toBe(live.symbol);
  expect(state().isRoundInSnapshot).toBe(false);
  expect(onSymbolChange).not.toHaveBeenCalled();
  expect(mocks.route).not.toHaveBeenCalled();
  expect(mocks.storageWrites).not.toHaveBeenCalled();
  act(() => state().goToLiveRound());
  expect(onSymbolChange).toHaveBeenCalledExactlyOnceWith({
    symbol: nextRound.symbol,
  });
  expect(state().selectedRow.symbol).toBe(live.symbol);
  act(() =>
    root.update(
      <PredictionWidget
        symbol={nextRound.symbol}
        onSymbolChange={onSymbolChange}
      />,
    ),
  );
  expect(state().selectedRow.symbol).toBe(nextRound.symbol);
});

it("only completes the default URL once while the host delays acceptance", () => {
  snapshotRows = [history, live, nextRound, eth];
  act(() => {
    root = create(<PredictionWidget />);
  });
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: `/prediction/${live.symbol}`,
    name: "prediction",
    replace: true,
  });
  act(() => {
    vi.advanceTimersByTime(240_010);
  });
  snapshotRows = [nextRound];
  act(() => root.update(<PredictionWidget />));
  expect(state().selectedRow.symbol).toBe(live.symbol);
  expect(mocks.route).toHaveBeenCalledOnce();
});

it("resolves a fresh default on returning from an explicit symbol to the base route", () => {
  act(() => {
    root = create(<PredictionWidget />);
  });
  act(() => root.update(<PredictionWidget symbol={history.symbol} />));
  snapshotRows = [nextRound];
  act(() => {
    vi.advanceTimersByTime(240_010);
  });
  mocks.route.mockClear();
  act(() => root.update(<PredictionWidget />));
  expect(state().selectedRow.symbol).toBe(nextRound.symbol);
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: `/prediction/${nextRound.symbol}`,
    name: "prediction",
    replace: true,
  });
});

it("pins the default and disables all selection without any selection channel", () => {
  mocks.routeEnabled = false;
  snapshotRows = [history, live, nextRound, eth];
  act(() => {
    root = create(<PredictionWidget />);
  });
  expect(state().selectedRow.symbol).toBe(live.symbol);
  expect(state().requestedSymbol).toBe(live.symbol);
  expect(state().onSelectSymbol).toBeUndefined();
  expect(state().onNavigatePerp).toBeUndefined();
  act(() => {
    vi.advanceTimersByTime(240_010);
  });
  expect(state().selectedRow.symbol).toBe(live.symbol);
  act(() => state().selectMarketRound(history.observation_start_at / 1000));
  act(() => state().goToLiveRound());
  act(() => expect(state().goToNextRound()).toBe(false));
  expect(state().selectedRow.symbol).toBe(live.symbol);
  snapshotRows = [nextRound];
  act(() => root.update(<PredictionWidget />));
  expect(state().selectedRow.symbol).toBe(live.symbol);
  expect(state().isRoundInSnapshot).toBe(false);
  expect(mocks.route).not.toHaveBeenCalled();
  expect(mocks.storageWrites).not.toHaveBeenCalled();
});

it("initializes the saved market once even when another market preference arrives", () => {
  storage.set(storageKey, JSON.stringify("PERP_ETH5M_USDC"));
  const onSymbolChange = vi.fn();
  act(() => {
    root = create(<PredictionWidget onSymbolChange={onSymbolChange} />);
  });
  expect(state().selectedRow.symbol).toBe(eth.symbol);
  storage.set(storageKey, JSON.stringify("PERP_BTC5M_USDC"));
  act(() => window.dispatchEvent(new Event("storage")));
  expect(state().selectedRow.symbol).toBe(eth.symbol);
  expect(onSymbolChange).not.toHaveBeenCalled();
  expect(mocks.route).not.toHaveBeenCalled();
});

it("anchors the default route to the newest history round when no market is live", () => {
  snapshotRows = [history];
  act(() => {
    root = create(<PredictionWidget />);
  });
  expect(state().selectedRow?.symbol).toBe(history.symbol);
  expect(state().isRoundInSnapshot).toBe(true);
  expect(state().isRoundTradable).toBe(false);
  expect(state().market?.hasLiveRow).toBe(false);
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: `/prediction/${history.symbol}`,
    name: "prediction",
    replace: true,
  });
});

it("prefers any live market over the remembered market's history", () => {
  snapshotRows = [history, eth];
  act(() => {
    root = create(<PredictionWidget />);
  });
  expect(state().selectedRow?.symbol).toBe(eth.symbol);
  expect(state().marketId).toBe("PERP_ETH5M_USDC");
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: `/prediction/${eth.symbol}`,
    name: "prediction",
    replace: true,
  });
});

it("does not jump between settled rounds when no live rounds remain", () => {
  const olderHistory = {
    ...history,
    symbol: "PERP_BTC5M2609291025_USDC",
    observation_start_at: now - 660_000,
    expire_at: now - 360_000,
  };
  snapshotRows = [olderHistory, history];
  act(() => {
    root = create(<PredictionWidget symbol={olderHistory.symbol} />);
  });
  expect(state().selectedRow?.symbol).toBe(olderHistory.symbol);
  act(() => state().goToLiveRound());
  expect(mocks.route).not.toHaveBeenCalled();
  expect(state().selectedRow?.symbol).toBe(olderHistory.symbol);
});

it("does not reuse accepted metadata while another symbol loads or on returning to the base route", () => {
  act(() => {
    root = create(<PredictionWidget symbol={live.symbol} />);
  });
  snapshotRows = [];
  mocks.query.mockReturnValue({ data: undefined, isLoading: true });
  act(() => root.update(<PredictionWidget symbol={eth.symbol} />));
  expect(state().selectedRow).toBeUndefined();
  expect(state().market).toBeUndefined();
  expect(state().marketRows).toEqual([]);
  expect(state().isRoundTradable).toBe(false);
  act(() => root.update(<PredictionWidget />));
  expect(state().selectedRow).toBeUndefined();
  expect(state().requestedSymbol).toBeUndefined();
  expect(mocks.query.mock.calls.at(-1)?.[0]).toBeNull();
  snapshotRows = [eth];
  act(() => root.update(<PredictionWidget />));
  expect(state().selectedRow.symbol).toBe(eth.symbol);
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: `/prediction/${eth.symbol}`,
    name: "prediction",
    replace: true,
  });
});
