import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { useBinaryRounds } from "@orderly.network/prediction/src/prediction/binary/useBinaryRounds";
import type { PredictionState } from "@orderly.network/prediction/src/prediction/prediction.script";
import { Prediction } from "@orderly.network/prediction/src/prediction/prediction.ui";
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
  "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui",
  () => ({
    formatPredictionMarketName: ({
      base,
      period,
    }: {
      base: string;
      period: string;
    }) => `${base} ${period}`,
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
  rounds = useBinaryRounds({
    active: true,
    symbol,
    onSymbolSelect: mocks.select,
  });
  const state = {
    ...rounds,
    isRoundsReady: !!rounds.selectedRow || rounds.isMissingHistoricalRound,
    isRoundsLoading: rounds.isLoading,
    requestedSymbol: symbol,
    onSelectSymbol: mocks.select,
    round: rounds.round ?? rounds.selectedRound ?? 0,
    selectedRound: rounds.selectedRound ?? 0,
    activeTab: "history",
    historyRecords: [],
    pendingSettlementSymbols: [],
    outcomePrices: {},
    priceHistory: [],
    candles: [],
  } as unknown as PredictionState;
  return <Prediction {...state} />;
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
it.each([true, false])(
  "retains missing-round status, navigation and history (desktop=%s)",
  (desktop) => {
    mocks.desktop = desktop;
    mount("PERP_BTC5M2610101045_USDC");
    expect(rounds.selectedRow).toBeUndefined();
    expect(rounds.isRoundTradable).toBe(false);
    expect(text()).toContain("prediction.notInSnapshot");
    expect(text()).toContain("BTC 5M");
    expect(text()).toContain("personal history retained");
    expect(text()).not.toContain("prediction.rounds.unavailable");
    const chart = root!.root.findByType(PriceChart);
    expect(chart.props.canGoToLiveMarket).toBe(true);
    expect(chart.props.selectedRound).toBe(
      Date.UTC(2026, 9, 10, 10, 45) / 1000,
    );
    act(() => chart.props.onGoToLiveMarket());
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith(live.symbol);
    expect(rounds.selectedRow).toBeUndefined();
  },
);
it("disables returning to live when the family has no active round", () => {
  mocks.rows = [];
  mount("PERP_BTC5M2610011350_USDC");
  expect(root!.root.findByType(PriceChart).props.canGoToLiveMarket).toBe(false);
  act(() => rounds.goToLiveRound());
  expect(mocks.select).not.toHaveBeenCalled();
  expect(text()).toContain("personal history retained");
});
it("keeps loading distinct from missing, then renders the missing round", () => {
  mocks.loading = true;
  mount("PERP_BTC5M2610011350_USDC");
  expect(rounds.isMissingHistoricalRound).toBe(false);
  expect(text()).toContain("loading");
  mocks.loading = false;
  act(() => root!.update(<Consumer symbol="PERP_BTC5M2610011350_USDC" />));
  expect(text()).toContain("prediction.notInSnapshot");
});
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
  "renders the actual missing-round chart return button (enabled=%s)",
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
    expect(button).toBeDefined();
    expect(button!.props.disabled).toBe(!enabled);
    expect(text()).not.toContain("$83021.82");
  },
);
