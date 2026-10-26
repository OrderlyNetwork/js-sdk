import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { useBinaryRounds } from "@orderly.network/prediction/src/prediction/binary/useBinaryRounds";
import type { PredictionState } from "@orderly.network/prediction/src/prediction/prediction.script";
import { PredictionWidget } from "@orderly.network/prediction/src/prediction/prediction.widget";
import { PriceChart } from "@orderly.network/prediction/src/prediction/predictionChart.ui";

const mocks = vi.hoisted(() => ({
  rows: [] as BinaryInfoRow[],
  detail: undefined as BinaryInfoRow | undefined,
  loading: false,
  error: undefined as Error | undefined,
  select: vi.fn(),
  desktop: true,
}));
vi.mock("@orderly.network/hooks", () => ({
  useLocalStorage: () => [null, () => {}],
  useQuery: () => ({
    data: mocks.detail,
    isLoading: mocks.loading,
    error: mocks.error,
  }),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  i18n: { t: (key: string) => key },
}));
vi.mock("@orderly.network/react-app", () => ({
  useFeatureEnabled: () => true,
  useAppContext: () => ({}),
  useCanTrade: () => false,
}));
vi.mock("@orderly.network/ui-assets", () => ({
  AssetViewWidget: () => null,
  useFirstTimeDeposit: () => false,
}));
vi.mock("@orderly.network/prediction/src/prediction/prediction.script", () => ({
  usePredictionScript: (
    _restricted: boolean,
    _active: boolean,
    _live: boolean,
    selection: { symbol?: string; onSymbolSelect: (symbol: string) => void },
  ) => {
    rounds = useBinaryRounds({ active: true, ...selection });
    return {
      ...rounds,
      rounds,
      isRoundsReady: !!rounds.selectedRow || rounds.isMissingHistoricalRound,
      isRoundsLoading: rounds.isLoading,
      round: rounds.round ?? rounds.selectedRound ?? 0,
      selectedRound: rounds.selectedRound ?? 0,
      activeTab: "history",
      historyRecords: [],
      pendingSettlementSymbols: [],
      outcomePrices: {},
      priceHistory: [],
      candles: [],
    } as unknown as PredictionState;
  },
}));
vi.mock("@orderly.network/markets-core", () => ({
  DataItem: () => null,
  DropDownMarketsWidget: ({ children }: React.PropsWithChildren) => children,
  TriangleDownIcon: () => null,
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
  Text: Object.assign(({ children }: React.PropsWithChildren) => children, {
    numeral: () => null,
  }),
  TokenIcon: () => null,
  Spinner: () => <span>loading</span>,
  CaretDownIcon: () => null,
  CaretUpIcon: () => null,
  ChevronDownIcon: () => null,
  ChevronRightIcon: () => null,
  parseNumber: String,
  Tooltip: ({ children }: React.PropsWithChildren) => children,
  ChevronUpIcon: () => null,
  Tabs: ({ children }: React.PropsWithChildren) => children,
  TabPanel: ({ children }: React.PropsWithChildren) => children,
  useMediaQuery: () => mocks.desktop,
  useScreen: () => ({ isMobile: !mocks.desktop }),
  toast: {},
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionMarkets",
  () => ({
    usePredictionMarkets: () => ({ rows: mocks.rows, isLoading: false }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/usePredictionMarketsDropdown",
  () => ({ usePredictionMarketsDropdown: () => ({}) }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionMarketSearch",
  () => ({
    formatPredictionMarketName: ({
      base,
      period,
    }: {
      base: string;
      period: string;
    }) => `${base} ${period}`,
    formatBinarySymbolName: (symbol?: string) => {
      const match = /^PERP_([A-Z0-9]+?)(5M|10M|15M)\d{10}_USDC$/.exec(
        symbol ?? "",
      );
      return match ? `${match[1]} ${match[2]}` : undefined;
    },
  }),
);
vi.mock("@orderly.network/prediction/src/prediction/predictionShared", () => ({
  formatPercent: () => "--",
  useIndexPriceFormatter: () => ({ format: String }),
  usePredictionFormatters: () => ({
    formatRoundWindow: (round: number) => String(round),
    chart: {
      roundTimeFormatter: { format: String },
      chartTimeFormatter: { format: String },
    },
  }),
}));
vi.mock("@orderly.network/prediction/src/prediction/dataPanels", () => ({}));
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/predictionAccountPanel.widget",
  () => ({
    PredictionAccountPanel: () => <div>personal history retained</div>,
  }),
);
vi.mock("@orderly.network/prediction/src/prediction/orderEntry", async () => ({
  RoundOrderStatusCard: (
    await import("@orderly.network/prediction/src/prediction/orderEntry/roundOrderStatusCard.ui")
  ).RoundOrderStatusCard,
  PredictionOrderBook: () => null,
  TradePanel: () => <div>trade form</div>,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionChart.ui",
  () => ({ PriceChart: () => null }),
);
const now = Date.UTC(2026, 9, 12, 14);
const live: BinaryInfoRow = {
  symbol: "PERP_BTC5M2610121400_USDC",
  product_type: "BINARY",
  status: "ACTIVE",
  activated_at: now - 60_000,
  observation_start_at: now,
  expire_at: now + 300_000,
  index_price_symbol: "PERP_BTC_USDC",
  fee_model: "BINARY_PROBABILITY",
  s0: null,
};
let rounds: ReturnType<typeof useBinaryRounds>;
let root: ReactTestRenderer | undefined;
function Consumer({ symbol }: { symbol?: string }) {
  return (
    <PredictionWidget
      symbol={symbol}
      onSymbolChange={({ symbol }) => mocks.select(symbol)}
    />
  );
}
function mount(symbol?: string) {
  act(() => {
    root = create(<Consumer symbol={symbol} />);
  });
}
function text() {
  return JSON.stringify(root!.toJSON());
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.rows = [live];
  mocks.detail = undefined;
  mocks.error = new Error("binary round not found");
  mocks.loading = false;
  mocks.desktop = true;
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubGlobal("window", { setTimeout, clearTimeout });
});
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it.each([
  [true, "PERP_BTC5M2610101045_USDC"],
  [false, "PERP_BTC5M2610101045_USDC"],
  [true, "PERP_BTC5M2610131400_USDC"],
  [false, "PERP_BTC5M2610131400_USDC"],
] as const)(
  "redirects a missing round without an empty-state flash (desktop=%s, symbol=%s)",
  (desktop, symbol) => {
    mocks.desktop = desktop;
    mount(symbol);
    expect(rounds.selectedRow).toBeUndefined();
    expect(rounds.isRoundTradable).toBe(false);
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith(live.symbol);
    expect(text()).toContain("loading");
    expect(text()).not.toContain("prediction.notInSnapshot");
    expect(text()).toContain("BTC 5M");
    expect(text()).not.toContain("prediction.rounds.unavailable");
    expect(root!.root.findAllByType(PriceChart)).toHaveLength(0);
    act(() => root!.update(<Consumer symbol={symbol} />));
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith(live.symbol);
    mocks.error = undefined;
    act(() => root!.update(<Consumer symbol={live.symbol} />));
    expect(rounds.selectedRow?.symbol).toBe(live.symbol);
    expect(text()).not.toContain("loading");
    expect(text()).toContain("trade form");
    expect(text()).toContain("personal history retained");
  },
);
it.each([true, false])(
  "shows the existing empty state when no same-market fallback exists (desktop=%s)",
  (desktop) => {
    mocks.desktop = desktop;
    mocks.rows = [
      {
        ...live,
        symbol: live.symbol.replace("BTC", "ETH"),
        index_price_symbol: "PERP_ETH_USDC",
      },
    ];
    mount("PERP_BTC5M2610011350_USDC");
    expect(root!.root.findAllByType(PriceChart)).toHaveLength(0);
    expect(rounds.canGoToLiveRound).toBe(false);
    act(() => rounds.goToLiveRound());
    expect(mocks.select).not.toHaveBeenCalled();
    expect(text()).toContain("prediction.rounds.unavailable");
    expect(text()).not.toContain("loading");
    expect(text()).not.toContain("prediction.notInSnapshot");
  },
);
it("waits for details before automatically returning to live", () => {
  mocks.loading = true;
  mount("PERP_BTC5M2610011350_USDC");
  expect(rounds.isMissingHistoricalRound).toBe(false);
  expect(text()).toContain("loading");
  expect(mocks.select).not.toHaveBeenCalled();
  mocks.loading = false;
  act(() => root!.update(<Consumer symbol="PERP_BTC5M2610011350_USDC" />));
  expect(text()).toContain("loading");
  expect(text()).not.toContain("prediction.notInSnapshot");
  expect(mocks.select).toHaveBeenCalledExactlyOnceWith(live.symbol);
});
it.each([true, false])(
  "keeps redirect loading when subsequent detail errors change (desktop=%s)",
  (desktop) => {
    mocks.desktop = desktop;
    const symbol = "PERP_BTC5M2610101045_USDC";
    mount(symbol);
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith(live.symbol);
    for (const message of ["Network request failed", "Internal server error"]) {
      mocks.error = new Error(message);
      act(() => root!.update(<Consumer symbol={symbol} />));
      expect(text()).toContain("loading");
      expect(text()).not.toContain("prediction.notInSnapshot");
      expect(text()).not.toContain("prediction.rounds.unavailable");
      expect(mocks.select).toHaveBeenCalledOnce();
    }
    mocks.error = undefined;
    act(() => root!.update(<Consumer symbol={live.symbol} />));
    expect(text()).not.toContain("loading");
    expect(text()).toContain("trade form");
  },
);
it("recovers to successful delisted DOWN details", () => {
  mount("PERP_BTC5M2610111350_USDC");
  mocks.error = undefined;
  mocks.detail = {
    ...live,
    symbol: "PERP_BTC5M2610111350_USDC",
    status: "DELISTED",
    observation_start_at: 1791726600000,
    expire_at: 1791726900000,
    s0: 83021.82,
    s1: 83011.65,
    outcome: "DOWN",
    settlement_price_per_share: 0,
    result_committed_at: 1791726902633,
  };
  act(() => root!.update(<Consumer symbol={mocks.detail!.symbol} />));
  expect(rounds.isMissingHistoricalRound).toBe(false);
  expect(rounds.selectedRow?.outcome).toBe("DOWN");
  expect(rounds.isRoundTradable).toBe(false);
  expect(text()).toContain("prediction.resolution.outcome");
  expect(text()).not.toContain("prediction.notInSnapshot");
});
it.each([undefined, "INVALID", "PERP_BTC5M2610131400_USDC"])(
  "keeps unavailable default, invalid and future symbols in the empty state: %s",
  (symbol) => {
    mocks.rows = [];
    mount(symbol);
    expect(rounds.isMissingHistoricalRound).toBe(false);
    expect(text()).toContain("prediction.rounds.unavailable");
    if (symbol === "PERP_BTC5M2610131400_USDC") {
      // The header shows the parsed market name, not the raw round symbol.
      expect(text()).toContain("BTC 5M");
      expect(text()).not.toContain(symbol);
    }
  },
);

vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown",
  () => ({ useRoundNow: () => Date.now() }),
);
vi.mock("@orderly.network/prediction/src/prediction/roundNavigator.ui", () => ({
  LiveIndicator: () => null,
  CountdownDisplay: () => null,
  RoundNavigator: () => null,
}));
it.each([true, false])(
  "only renders the missing-round chart return button with a live target (enabled=%s)",
  async (enabled) => {
    const { PriceChart: ActualChart } = await vi.importActual<
      typeof import("@orderly.network/prediction/src/prediction/predictionChart.ui")
    >("@orderly.network/prediction/src/prediction/predictionChart.ui");
    act(() => {
      root = create(
        <ActualChart
          intervalSeconds={300}
          base="BTC"
          selectedRound={1791726600}
          onSelectRound={() => {}}
          points={[]}
          candles={[]}
          roundOutcome={() => undefined}
          selectedRow={undefined}
          rows={enabled ? [live] : []}
          currentPrice={undefined}
          round={now / 1000}
          onGoToLiveMarket={mocks.select}
          isRoundUnavailable
          canGoToLiveMarket={enabled}
        />,
      );
    });
    const button = root!.root
      .findAllByType("button")
      .find((node) =>
        node.children.includes("prediction.rounds.goToLiveMarket"),
      );
    expect(!!button).toBe(enabled);
    if (button) expect(button.props.disabled).toBe(false);
    expect(text()).not.toContain("$83021.82");
  },
);

const future: BinaryInfoRow = {
  ...live,
  symbol: "PERP_BTC5M2610121405_USDC",
  observation_start_at: now + 300_000,
  expire_at: now + 600_000,
};
const historicalSymbol = "PERP_BTC5M2610101045_USDC";

it.each(
  [true, false].flatMap((desktop) => [
    { desktop, target: future },
    {
      desktop,
      target: {
        ...live,
        symbol: "PERP_BTC5M2610121355_USDC",
        observation_start_at: now - 300_000,
        expire_at: now,
        status: "DELISTED" as const,
        outcome: "DOWN" as const,
        s0: 100,
        s1: 99,
        settlement_price_per_share: 0,
        result_committed_at: now,
      },
    },
  ]),
)(
  "loads until the host accepts a future or expired fallback (desktop=$desktop, target=$target.symbol)",
  ({ desktop, target }) => {
    mocks.desktop = desktop;
    mocks.rows = [target];
    mount(historicalSymbol);
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith(target.symbol);
    expect(text()).toContain("loading");
    expect(text()).not.toContain("prediction.rounds.unavailable");
    expect(text()).not.toContain("prediction.notInSnapshot");
    expect(root!.root.findAllByType(PriceChart)).toHaveLength(0);
    act(() => root!.update(<Consumer symbol={historicalSymbol} />));
    expect(mocks.select).toHaveBeenCalledOnce();
    act(() => root!.update(<Consumer symbol={target.symbol} />));
    expect(rounds.selectedRow?.symbol).toBe(target.symbol);
    expect(text()).not.toContain("loading");
    expect(text()).not.toContain("prediction.rounds.unavailable");
    expect(root!.root.findAllByType(PriceChart)).toHaveLength(1);
  },
);

it.each([
  {
    name: "future only",
    rows: [future],
    symbol: historicalSymbol,
    time: now,
    expected: false,
  },
  {
    name: "selected live",
    rows: [live],
    symbol: live.symbol,
    time: now,
    expected: false,
  },
  {
    name: "missing history at T0",
    rows: [live],
    symbol: historicalSymbol,
    time: now,
    expected: true,
  },
  {
    name: "selected future",
    rows: [future, live],
    symbol: future.symbol,
    time: now,
    expected: true,
  },
  {
    name: "before T0",
    rows: [live],
    symbol: historicalSymbol,
    time: now - 1,
    expected: false,
  },
  {
    name: "at T1",
    rows: [live],
    symbol: historicalSymbol,
    time: live.expire_at,
    expected: false,
  },
  {
    name: "inactive",
    rows: [{ ...live, status: "DELISTED" as const }],
    symbol: historicalSymbol,
    time: now,
    expected: false,
  },
])("only allows live navigation: $name", ({ rows, symbol, time, expected }) => {
  vi.setSystemTime(time);
  mocks.rows = rows;
  mount(symbol);
  expect(rounds.canGoToLiveRound).toBe(expected);
  mocks.select.mockClear();
  act(() => rounds.goToLiveRound());
  if (expected)
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith(live.symbol);
  else expect(mocks.select).not.toHaveBeenCalled();
});

it("rechecks expiry when clicking a previously available live target", () => {
  mount(historicalSymbol);
  expect(rounds.canGoToLiveRound).toBe(true);
  const jump = rounds.goToLiveRound;
  mocks.select.mockClear();
  vi.setSystemTime(live.expire_at);
  act(() => jump());
  expect(mocks.select).not.toHaveBeenCalled();
});

it.each([
  {
    name: "future only",
    rows: [future],
    selectedRow: undefined,
    selectedRound: 1791726600,
    time: now,
    expected: false,
  },
  {
    name: "selected live",
    rows: [live],
    selectedRow: live,
    selectedRound: now / 1000,
    time: now,
    expected: false,
  },
  {
    name: "selected future",
    rows: [future, live],
    selectedRow: future,
    selectedRound: future.observation_start_at / 1000,
    time: now,
    expected: true,
  },
  {
    name: "at T0",
    rows: [live],
    selectedRow: undefined,
    selectedRound: 1791726600,
    time: now,
    expected: true,
  },
  {
    name: "before T0",
    rows: [live],
    selectedRow: undefined,
    selectedRound: 1791726600,
    time: now - 1,
    expected: false,
  },
  {
    name: "at T1",
    rows: [live],
    selectedRow: undefined,
    selectedRound: 1791726600,
    time: live.expire_at,
    expected: false,
  },
  {
    name: "inactive",
    rows: [{ ...live, status: "DELISTED" as const }],
    selectedRow: undefined,
    selectedRound: 1791726600,
    time: now,
    expected: false,
  },
])(
  "renders the live button using the chart clock: $name",
  async ({ rows, selectedRow, selectedRound, time, expected }) => {
    const { PriceChart: ActualChart } = await vi.importActual<
      typeof import("@orderly.network/prediction/src/prediction/predictionChart.ui")
    >("@orderly.network/prediction/src/prediction/predictionChart.ui");
    const render = () => (
      <ActualChart
        intervalSeconds={300}
        base="BTC"
        selectedRound={selectedRound}
        onSelectRound={() => {}}
        points={[]}
        candles={[]}
        roundOutcome={() => undefined}
        selectedRow={selectedRow}
        rows={rows}
        currentPrice={undefined}
        round={now / 1000}
        onGoToLiveMarket={mocks.select}
        isRoundUnavailable={!selectedRow}
        canGoToLiveMarket
      />
    );
    act(() => {
      root = create(render());
    });
    // Keep the parent's eligibility stale while the chart clock crosses a boundary.
    vi.setSystemTime(time);
    act(() => root!.update(render()));
    const button = root!.root
      .findAllByType("button")
      .find((node) =>
        node.children.includes("prediction.rounds.goToLiveMarket"),
      );
    expect(!!button).toBe(expected);
  },
);
