import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { PriceChart } from "@orderly.network/prediction/src/prediction/predictionChart.ui";

const now = Date.UTC(2026, 9, 13, 2, 9, 57);
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
  CaretDownIcon: () => null,
  CaretUpIcon: () => null,
  ChevronDownIcon: () => null,
  ChevronRightIcon: () => null,
  ChevronUpIcon: () => null,
  parseNumber: String,
  Spinner: () => <span>spinner</span>,
  Tooltip: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock("@orderly.network/prediction/src/prediction/predictionShared", () => ({
  useIndexPriceFormatter: () => ({
    format: (value: number) => value.toFixed(2),
  }),
  usePredictionFormatters: () => ({
    chart: {
      roundTimeFormatter: { format: String },
      chartTimeFormatter: { format: String },
    },
  }),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown",
  () => ({ useRoundNow: () => Date.UTC(2026, 9, 13, 2, 9, 57) }),
);
vi.mock("@orderly.network/prediction/src/prediction/roundNavigator.ui", () => ({
  LiveIndicator: () => null,
  CountdownDisplay: () => null,
  RoundNavigator: ({
    chartMode,
    onChartModeChange,
  }: {
    chartMode: "price" | "candles";
    onChartModeChange: (mode: "price" | "candles") => void;
  }) => (
    <button
      onClick={() =>
        onChartModeChange(chartMode === "price" ? "candles" : "price")
      }
    >
      Toggle chart
    </button>
  ),
}));

let root: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

function mount(
  current: number,
  historical: boolean,
  historyStatus?: React.ComponentProps<typeof PriceChart>["historyStatus"],
) {
  const expiry = historical ? now - 1 : now + 3000;
  const row: BinaryInfoRow = {
    symbol: "PERP_BTC5M2610130205_USDC",
    product_type: "BINARY",
    fee_model: "BINARY_PROBABILITY",
    status: "ACTIVE",
    activated_at: expiry - 360_000,
    observation_start_at: expiry - 300_000,
    expire_at: expiry,
    index_price_symbol: "PERP_BTC_USDC",
    s0: 82423.99,
    s1: historical ? current : null,
  };
  act(() => {
    root = create(
      <PriceChart
        intervalSeconds={300}
        base="BTC"
        selectedRound={row.observation_start_at / 1000}
        onSelectRound={() => {}}
        points={[{ timestamp: expiry - 4000, price: current }]}
        candles={[]}
        historyStatus={historyStatus}
        roundOutcome={() => undefined}
        selectedRow={row}
        rows={[row]}
        currentPrice={historical ? 99999 : current}
        round={row.observation_start_at / 1000}
        onGoToLiveMarket={() => {}}
      />,
    );
  });
}

type ChartProps = React.ComponentProps<typeof PriceChart>;
function update(patch: Partial<ChartProps>) {
  const props = root!.root.findByType(PriceChart).props;
  act(() => root!.update(<PriceChart {...props} {...patch} />));
}
const seed = (offset = 0) =>
  Array.from({ length: 75 }, (_, index) => ({
    timestamp: now - (75 - index) * 60_000,
    open: 82000 + index + offset,
    high: 82100 + index + offset,
    low: 81900 + index + offset,
    close: 82050 + index + offset,
  }));
function candleMode() {
  act(() =>
    root!.root
      .findAllByType("button")
      .find((node) => node.children.includes("Toggle chart"))!
      .props.onClick(),
  );
}
function drawing() {
  return JSON.stringify(
    root!.root
      .findByType("svg")
      .findAllByType("rect")
      .map((node) => node.props),
  );
}
function statusText() {
  return root!.root.findAllByProps({ role: "status" }).map((node) =>
    node
      .findAllByType("span")
      .flatMap((span) => span.children)
      .join(""),
  );
}
it("freezes complete candles and reference lines while another round loads, then replaces once ready", () => {
  mount(82423.03, false);
  update({ candles: seed(), historyStatus: "ready" });
  candleMode();
  const before = drawing();
  const lines = root!.root
    .findByType("svg")
    .findAllByType("line")
    .map((node) => node.props);
  update({
    selectedRound: 123,
    candles: seed(1000).slice(-2),
    historyStatus: "loading",
    currentPrice: 85000,
  });
  expect(drawing()).toBe(before);
  expect(
    root!.root
      .findByType("svg")
      .findAllByType("line")
      .map((node) => node.props),
  ).toEqual(lines);
  expect(statusText()).toEqual(["spinner"]);
  expect(root!.root.findAll((node) => !!node.props.onPointerMove)).toHaveLength(
    0,
  );
  update({ historyStatus: "error" });
  expect(drawing()).toBe(before);
  expect(statusText().join()).toContain("prediction.chart.historyError");
  update({ historyStatus: "ready", candles: seed(1000) });
  expect(drawing()).not.toBe(before);
  expect(statusText()).toHaveLength(0);
});
it("hides partial candles without a snapshot and distinguishes empty success", () => {
  mount(82423.03, false);
  update({ candles: seed().slice(-2), historyStatus: "loading" });
  expect(statusText()).toEqual(["spinner"]);
  candleMode();
  expect(root!.root.findByType("svg").findAllByType("rect")).toHaveLength(0);
  expect(statusText()).toEqual(["spinner"]);
  update({ historyStatus: "error" });
  expect(statusText().join()).toContain("prediction.chart.historyError");
  update({ historyStatus: "ready", candles: [] });
  expect(statusText()).toHaveLength(0);
  expect(
    root!.root
      .findAllByType("div")
      .some((node) => node.children.includes("prediction.noData")),
  ).toBe(true);
});
it("idle requests do not show a loading overlay or partial candles", () => {
  mount(82423.03, false);
  update({ candles: seed(), historyStatus: "idle", isRoundUnavailable: true });
  candleMode();
  expect(statusText()).toHaveLength(0);
  expect(root!.root.findByType("svg").findAllByType("rect")).toHaveLength(0);
});
it("a market remount discards the previous candle snapshot", () => {
  mount(82423.03, false);
  update({ candles: seed(), historyStatus: "ready" });
  candleMode();
  const props = root!.root.findByType(PriceChart).props;
  act(() =>
    root!.update(
      <PriceChart key="ETH" {...props} base="ETH" historyStatus="loading" />,
    ),
  );
  candleMode();
  expect(root!.root.findByType("svg").findAllByType("rect")).toHaveLength(0);
  expect(statusText()).toEqual(["spinner"]);
});

it("retains the live line while a historical round loads, including on failure", () => {
  mount(82423.03, false, "ready");
  const before = root!.root
    .findByType("svg")
    .findAllByType("path")
    .map((node) => node.props);
  const original = root!.root.findByType(PriceChart).props
    .selectedRow as BinaryInfoRow;
  const historicalRow = {
    ...original,
    observation_start_at: now - 600000,
    expire_at: now - 300000,
    s1: 82300,
  };
  update({
    selectedRound: historicalRow.observation_start_at / 1000,
    selectedRow: historicalRow,
    rows: [historicalRow],
    points: [],
    historyStatus: "loading",
  });
  expect(statusText()).toEqual(["spinner"]);
  expect(
    root!.root
      .findByType("svg")
      .findAllByType("path")
      .map((node) => node.props),
  ).toEqual(before);
  expect(root!.root.findAll((node) => !!node.props.onPointerMove)).toHaveLength(
    0,
  );
  expect(
    root!.root
      .findAllByType("div")
      .some((node) => node.children.includes("prediction.noData")),
  ).toBe(false);
  update({ historyStatus: "error" });
  expect(statusText().join()).toContain("prediction.chart.historyError");
  update({
    historyStatus: "ready",
    points: [{ timestamp: historicalRow.expire_at - 4000, price: 82300 }],
  });
  expect(statusText()).toHaveLength(0);
  expect(
    root!.root
      .findByType("svg")
      .findAllByType("path")
      .map((node) => node.props),
  ).not.toEqual(before);
});
it("shows loading instead of no data when a historical line has no previous snapshot", () => {
  mount(82423.03, true, "loading");
  expect(statusText()).toEqual(["spinner"]);
  expect(
    root!.root
      .findByType("svg")
      .findAllByType("path")
      .every((node) => !node.props.d),
  ).toBe(true);
  expect(
    root!.root
      .findAllByType("div")
      .some((node) => node.children.includes("prediction.noData")),
  ).toBe(false);
  update({ historyStatus: "error" });
  expect(statusText().join()).toContain("prediction.chart.historyError");
  update({ historyStatus: "ready", points: [] });
  expect(statusText()).toHaveLength(0);
  expect(
    root!.root
      .findAllByType("div")
      .some((node) => node.children.includes("prediction.noData")),
  ).toBe(true);
});

it("keeps separate snapshots when switching chart mode during historical loading", () => {
  mount(82423.03, true, "ready");
  update({ candles: seed() });
  const line = root!.root
    .findByType("svg")
    .findAllByType("path")
    .map((node) => node.props);
  candleMode();
  const candles = drawing();
  update({
    selectedRound: 123,
    points: [],
    candles: [],
    historyStatus: "loading",
  });
  expect(drawing()).toBe(candles);
  candleMode();
  expect(statusText()).toEqual(["spinner"]);
  expect(
    root!.root
      .findByType("svg")
      .findAllByType("path")
      .map((node) => node.props),
  ).toEqual(line);
  candleMode();
  expect(drawing()).toBe(candles);
});

it.each(["live", "upcoming"])(
  "waits for initial %s line history rather than exposing the short live tail",
  (phase) => {
    mount(82423.03, false, "loading");
    const initialRow = root!.root.findByType(PriceChart).props
      .selectedRow as BinaryInfoRow;
    const row =
      phase === "upcoming"
        ? {
            ...initialRow,
            observation_start_at: now + 60000,
            expire_at: now + 360000,
            s0: null,
          }
        : initialRow;
    update({
      selectedRow: row,
      rows: [row],
      selectedRound: row.observation_start_at / 1000,
      points: [{ timestamp: now - 1000, price: 82423.03 }],
    });
    expect(statusText()).toEqual(["spinner"]);
    expect(
      root!.root
        .findByType("svg")
        .findAllByType("path")
        .every((node) => !node.props.d),
    ).toBe(true);
    expect(
      root!.root.findAll((node) => !!node.props.onPointerMove),
    ).toHaveLength(0);
    update({ historyStatus: "error" });
    expect(statusText().join()).toContain("prediction.chart.historyError");
    update({ historyStatus: "ready" });
    expect(statusText()).toHaveLength(0);
    expect(
      root!.root
        .findByType("svg")
        .findAllByType("path")
        .every((node) => !!node.props.d),
    ).toBe(true);
    update({ points: [{ timestamp: now - 1000, price: 82424 }] });
    expect(statusText()).toHaveLength(0);
  },
);
it("retains the full previous line when selecting an upcoming round", () => {
  mount(82423.03, false, "ready");
  const before = root!.root
    .findByType("svg")
    .findAllByType("path")
    .map((node) => node.props);
  const oldRow = root!.root.findByType(PriceChart).props
    .selectedRow as BinaryInfoRow;
  const futureRow = {
    ...oldRow,
    observation_start_at: now + 60000,
    expire_at: now + 360000,
    s0: null,
  };
  update({
    selectedRound: futureRow.observation_start_at / 1000,
    selectedRow: futureRow,
    rows: [futureRow],
    historyStatus: "loading",
    points: [],
  });
  expect(statusText()).toEqual(["spinner"]);
  expect(
    root!.root
      .findByType("svg")
      .findAllByType("path")
      .map((node) => node.props),
  ).toEqual(before);
  update({
    historyStatus: "ready",
    points: [{ timestamp: now - 1000, price: 82424 }],
  });
  expect(statusText()).toHaveLength(0);
  expect(
    root!.root
      .findByType("svg")
      .findAllByType("path")
      .map((node) => node.props),
  ).not.toEqual(before);
});

it.each(["upcoming", "live", "ended"])(
  "candle history stays gated on initial load and round switches (%s)",
  (phase) => {
    mount(82423.03, phase === "ended", "loading");
    const initialRow = root!.root.findByType(PriceChart).props
      .selectedRow as BinaryInfoRow;
    const row =
      phase === "upcoming"
        ? {
            ...initialRow,
            observation_start_at: now + 60000,
            expire_at: now + 360000,
            s0: null,
          }
        : initialRow;
    update({
      selectedRow: row,
      rows: [row],
      selectedRound: row.observation_start_at / 1000,
      candles: seed().slice(-2),
    });
    candleMode();
    expect(statusText()).toEqual(["spinner"]);
    expect(root!.root.findByType("svg").findAllByType("rect")).toHaveLength(0);
    expect(
      root!.root.findAll((node) => !!node.props.onPointerMove),
    ).toHaveLength(0);
    expect(
      root!.root
        .findAllByType("div")
        .some((node) => node.children.includes("prediction.noData")),
    ).toBe(false);
    update({ historyStatus: "error" });
    expect(root!.root.findByType("svg").findAllByType("rect")).toHaveLength(0);
    expect(statusText().join()).toContain("prediction.chart.historyError");
    update({ historyStatus: "ready", candles: seed() });
    expect(statusText()).toHaveLength(0);
    expect(root!.root.findByType("svg").findAllByType("rect")).toHaveLength(75);
    const before = drawing();
    const nextRow = {
      ...row,
      observation_start_at: row.observation_start_at + 300000,
      expire_at: row.expire_at + 300000,
    };
    update({
      selectedRound: nextRow.observation_start_at / 1000,
      selectedRow: nextRow,
      rows: [nextRow],
      historyStatus: "loading",
      candles: seed(1000).slice(-2),
    });
    expect(statusText()).toEqual(["spinner"]);
    expect(drawing()).toBe(before);
    update({ historyStatus: "ready", candles: seed(1000) });
    expect(statusText()).toHaveLength(0);
    expect(root!.root.findByType("svg").findAllByType("rect")).toHaveLength(75);
    expect(drawing()).not.toBe(before);
  },
);
