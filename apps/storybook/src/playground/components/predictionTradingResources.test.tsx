import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createOrderKeyRegistry } from "@orderly.network/hooks/src/provider/dataCenter/orderKeyRegistry";
import { usePredictionAccountData } from "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData";
import type { TradingPageProps } from "@orderly.network/trading-shared";
import { TradingPage } from "@orderly.network/trading/src/pages/trading/trading.page";
import { AccountStatusEnum, type API } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  featureEnabled: true,
  context: {} as Record<string, unknown>,
  query: vi.fn(),
  privateQuery: vi.fn(),
  orderQuery: vi.fn(),
  refresh: vi.fn(async () => undefined),
  accountId: "a",
  cache: new Map(),
  positions: [] as Pick<
    API.Position,
    "symbol" | "position_qty" | "average_open_price"
  >[],
  metadata: [] as Pick<
    API.BinaryInfoRow,
    | "symbol"
    | "product_type"
    | "fee_model"
    | "index_price_symbol"
    | "status"
    | "observation_start_at"
    | "expire_at"
  >[],
}));
vi.mock("@orderly.network/hooks", async () => ({
  useOrderStream: (
    await vi.importActual<
      typeof import("@orderly.network/hooks/src/orderly/useOrderStream/useOrderStream")
    >("@orderly.network/hooks/src/orderly/useOrderStream/useOrderStream")
  ).useOrderStream,
  useMemoizedFn: (
    await vi.importActual<
      typeof import("@orderly.network/hooks/src/shared/useMemoizedFn")
    >("@orderly.network/hooks/src/shared/useMemoizedFn")
  ).useMemoizedFn,
  useAccount: () => ({
    state: {
      accountId: mocks.accountId,
      status: AccountStatusEnum.EnableTrading,
    },
  }),
  useAccountInfo: () => ({ data: {} }),
  useCollateral: () => ({ freeCollateral: 1000 }),
  usePositions: () => mocks.positions,
  useMarkPricesStream: () => ({ data: {} }),
  useSWRConfig: () => ({ cache: mocks.cache }),
  unstable_serialize: (await vi.importActual<any>("swr")).unstable_serialize,
  useRefreshOrderCaches: () => mocks.refresh,
  useSubAccountQuery: () => ({ mutate: mocks.refresh }),
  useSubAccountMutation: () => [vi.fn(), {}],
  useMutation: () => [vi.fn(), {}],
  useLocalStorage: () => [null, vi.fn()],
  usePrivateQuery: (key: string | null) => {
    mocks.privateQuery(key, mocks.accountId);
    return {
      data: key === "/v1/positions" ? { rows: mocks.positions } : undefined,
      mutate: mocks.refresh,
      isLoading: false,
    };
  },
  useQuery: (key: string | null, options?: { keepPreviousData?: boolean }) => {
    mocks.query(key);
    return {
      // Simulate a warm SWR cache even for disabled consumers.
      data:
        key === "/v1/public/binary/info" ||
        (key === null && options?.keepPreviousData)
          ? mocks.metadata
          : undefined,
      isLoading: false,
    };
  },
  // The region gate is not under test here; unrestricted keeps it inert.
  useProductRegionRestricted: () => false,
}));
vi.mock(
  "@orderly.network/hooks/src/provider/dataCenter/dataCenterContext",
  () => ({
    useDataCenterContext: () => mocks.context,
  }),
);
vi.mock("@orderly.network/hooks/src/useMutation", () => ({
  useMutation: () => [vi.fn(), {}],
}));
vi.mock("@orderly.network/hooks/src/orderly/useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({ data: {} }),
}));
vi.mock("@orderly.network/hooks/src/orderly/useSymbolsInfo", () => ({
  useSymbolsInfo: () => ({}),
}));
vi.mock("@orderly.network/hooks/src/usePrivateInfiniteQuery", () => ({
  usePrivateInfiniteQuery: (
    key: ((page: number, previous: unknown) => string | null) | null,
  ) => {
    const url = key?.(0, null) ?? null;
    mocks.orderQuery(url);
    return {
      data: url ? [{ rows: [], meta: { total: 0 } }] : undefined,
      mutate: mocks.refresh,
      setSize: vi.fn(),
      isLoading: false,
      isValidating: false,
    };
  },
}));
vi.mock("@orderly.network/i18n", () => ({ i18n: { t: (key: string) => key } }));
vi.mock("@orderly.network/ui", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@orderly.network/react-app", () => ({
  useFeatureEnabled: () => mocks.featureEnabled,
  useAppContext: () => ({ onRouteChange: vi.fn() }),
}));
vi.mock("@orderly.network/trading/src/hooks/useTradingLocalStorage", () => ({
  useTradingLocalStorage: () => ({
    showAllSymbol: true,
    pnlNotionalDecimalPrecision: 2,
  }),
}));
vi.mock("@orderly.network/trading/src/provider/tradingPageProvider", () => ({
  TradingPageProvider: () => null,
}));
vi.mock("@orderly.network/trading/src/pages/trading/trading.widget", () => ({
  TradingWidget: () => null,
}));
vi.mock("@orderly.network/prediction", async () => ({
  usePredictionTradingExtension: (
    await import("@orderly.network/prediction/src/prediction/usePredictionTradingExtension")
  ).usePredictionTradingExtension,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionFavorites",
  () => ({
    usePredictionFavorites: () => ({
      favoriteMarketIds: [],
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
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductDataPanel.ui",
  () => ({
    SharedProductDataPanel: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.ui",
  () => ({
    SharedProductOrdersPanel: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.mobile.ui",
  () => ({
    MobileSharedProductOrdersPanel: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductHistory.mobile.ui",
  () => ({
    MobileSharedProductHistory: () => null,
  }),
);

let root: ReactTestRenderer | undefined;
let registry: ReturnType<typeof createOrderKeyRegistry>;
const props: TradingPageProps = {
  symbol: "PERP_BTC_USDC",
  tradingViewConfig: { library_path: "/tradingview/" },
};
const customMarkets = {};
const customMarketSlots = {
  marketsDropdown: customMarkets,
  marketsSheet: customMarkets,
  sideMarkets: customMarkets,
};
const customAccount = {};
const expiredHolding = {
  symbol: "PERP_BTC5M2601010000_USDC",
  position_qty: 2,
  average_open_price: 0.5,
};
function update(overrides: Partial<TradingPageProps> = {}) {
  act(() => {
    const page = <TradingPage {...props} {...overrides} />;
    if (root) root.update(page);
    else root = create(page);
  });
}
function clearQueries() {
  mocks.query.mockClear();
  mocks.privateQuery.mockClear();
  mocks.orderQuery.mockClear();
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.UTC(2026, 9, 10, 12));
  vi.stubGlobal("window", { setTimeout, clearTimeout });
  vi.clearAllMocks();
  mocks.featureEnabled = true;
  mocks.cache.clear();
  mocks.accountId = "a";
  mocks.positions = [];
  mocks.metadata = [
    {
      symbol: "PERP_BTC5M2610101200_USDC",
      product_type: "BINARY",
      fee_model: "BINARY_PROBABILITY",
      index_price_symbol: "PERP_BTC_USDC",
      status: "ACTIVE",
      observation_start_at: Date.now(),
      expire_at: Date.now() + 300_000,
    },
  ];
  registry = createOrderKeyRegistry();
  mocks.context = {
    registerKeyHandler: registry.register,
    unregisterKeyHandler: registry.unregister,
  };
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("starts no Prediction queries, order registration, or clock when all market slots and account content are overridden", () => {
  update({
    ...customMarketSlots,
    dataListProductContent: customAccount,
  });
  expect(mocks.query.mock.calls.every(([key]) => key === null)).toBe(true);
  expect(mocks.privateQuery.mock.calls.every(([key]) => key === null)).toBe(
    true,
  );
  expect(mocks.orderQuery.mock.calls.every(([key]) => key === null)).toBe(true);
  expect(registry.handlers.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});

it("retains account metadata without automatic market surfaces and releases private resources when account content is overridden", async () => {
  mocks.positions = [expiredHolding];
  update(customMarketSlots);
  await act(async () => {});
  expect(mocks.query.mock.calls.map(([key]) => key)).toContain(
    "/v1/public/binary/info",
  );
  expect(mocks.query.mock.lastCall?.[0]).toBeNull();
  expect(registry.handlers.size).toBe(3);
  expect(mocks.privateQuery.mock.calls.map(([key]) => key)).toContain(
    "/v1/positions",
  );
  expect(vi.getTimerCount()).toBe(2);
  clearQueries();
  update({ dataListProductContent: customAccount });
  await act(async () => {});
  expect(mocks.query.mock.lastCall?.[0]).toBe("/v1/public/binary/info");
  expect(
    mocks.query.mock.calls.slice(-4, -1).every(([key]) => key === null),
  ).toBe(true);
  expect(mocks.privateQuery.mock.calls.every(([key]) => key === null)).toBe(
    true,
  );
  expect(mocks.orderQuery.mock.calls.every(([key]) => key === null)).toBe(true);
  expect(registry.handlers.size).toBe(0);
  expect(vi.getTimerCount()).toBe(1);
  clearQueries();
  update({
    ...customMarketSlots,
    dataListProductContent: customAccount,
  });
  expect(mocks.query.mock.calls.every(([key]) => key === null)).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
  update(customMarketSlots);
  await act(async () => {});
  expect(registry.handlers.size).toBe(3);
  expect(vi.getTimerCount()).toBe(2);
  mocks.accountId = "b";
  mocks.positions = [];
  clearQueries();
  update(customMarketSlots);
  await act(async () => {});
  expect(mocks.privateQuery.mock.calls.every(([, id]) => id === "b")).toBe(
    true,
  );
  expect(vi.getTimerCount()).toBe(1);
  act(() => root!.unmount());
  root = undefined;
  expect(registry.handlers.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});

it("keeps a second consumer's order keys, market clock, and settlement polling when the first is overridden", async () => {
  mocks.positions = [expiredHolding];
  act(() => {
    root = create(
      <>
        <TradingPage key="a" {...props} />
        <TradingPage key="b" {...props} {...customMarketSlots} />
      </>,
    );
  });
  await act(async () => {});
  expect(registry.handlers.size).toBe(3);
  expect(vi.getTimerCount()).toBe(4);
  act(() =>
    root!.update(
      <>
        <TradingPage
          key="a"
          {...props}
          {...customMarketSlots}
          dataListProductContent={customAccount}
        />
        <TradingPage key="b" {...props} {...customMarketSlots} />
      </>,
    ),
  );
  await act(async () => {});
  expect(registry.handlers.size).toBe(3);
  expect(vi.getTimerCount()).toBe(2);
  mocks.refresh.mockClear();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(mocks.refresh).toHaveBeenCalledTimes(1);
  act(() => root!.unmount());
  root = undefined;
  expect(registry.handlers.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});

it("keeps market queries and the round clock when only the dropdown is overridden", async () => {
  update({
    marketsDropdown: customMarkets,
    dataListProductContent: customAccount,
  });
  await act(async () => {});
  expect(mocks.query.mock.lastCall?.[0]).toBe("/v1/public/binary/info");
  expect(registry.handlers.size).toBe(0);
  expect(vi.getTimerCount()).toBe(1);

  clearQueries();
  update({ ...customMarketSlots, dataListProductContent: customAccount });
  expect(mocks.query.mock.calls.every(([key]) => key === null)).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

it("releases feature-owned resources on global disable and restores them on re-enable", async () => {
  mocks.positions = [expiredHolding];
  update();
  await act(async () => {});
  expect(registry.handlers.size).toBe(3);
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  mocks.featureEnabled = false;
  clearQueries();
  update();
  await act(async () => {});
  expect(mocks.query.mock.calls.every(([key]) => key === null)).toBe(true);
  expect(mocks.privateQuery.mock.calls.every(([key]) => key === null)).toBe(
    true,
  );
  expect(mocks.orderQuery.mock.calls.every(([key]) => key === null)).toBe(true);
  expect(registry.handlers.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  mocks.refresh.mockClear();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(mocks.refresh).not.toHaveBeenCalled();
  mocks.featureEnabled = true;
  update();
  await act(async () => {});
  expect(registry.handlers.size).toBe(3);
  expect(vi.getTimerCount()).toBeGreaterThan(0);
});

it("preserves a separate account-data consumer when the page integration is globally disabled", async () => {
  function AccountConsumer() {
    usePredictionAccountData();
    return null;
  }
  mocks.positions = [expiredHolding];
  mocks.featureEnabled = false;
  const content = () => (
    <>
      <TradingPage {...props} />
      <AccountConsumer />
    </>
  );
  act(() => {
    root = create(content());
  });
  await act(async () => {});
  const accountKeys = [...registry.handlers.keys()];
  expect(accountKeys).toHaveLength(1);
  mocks.featureEnabled = true;
  act(() => root!.update(content()));
  await act(async () => {});
  expect(registry.handlers.size).toBe(3);
  const activeTimers = vi.getTimerCount();
  mocks.featureEnabled = false;
  act(() => root!.update(content()));
  await act(async () => {});
  expect([...registry.handlers.keys()]).toEqual(accountKeys);
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  expect(vi.getTimerCount()).toBeLessThan(activeTimers);
  mocks.refresh.mockClear();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(mocks.refresh).toHaveBeenCalledOnce();
  act(() => root!.unmount());
  root = undefined;
  expect(registry.handlers.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});
