import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { PriceChart } from "@orderly.network/prediction/src/prediction/predictionChart.ui";

const now = Date.UTC(2026, 9, 13, 2, 9, 57);
const formatterArgs = vi.hoisted(() => vi.fn());
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
  CaretDownIcon: () => <i data-direction="down" />,
  CaretUpIcon: () => <i data-direction="up" />,
  ChevronDownIcon: () => null,
  ChevronRightIcon: () => null,
  ChevronUpIcon: () => null,
  parseNumber: String,
  Tooltip: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock("@orderly.network/prediction/src/prediction/predictionShared", () => ({
  useIndexPriceFormatter: (...args: unknown[]) => {
    formatterArgs(...args);
    return { format: (value: number) => value.toFixed(2) };
  },
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
    onChartModeChange,
  }: {
    onChartModeChange: (mode: "candles") => void;
  }) => (
    <button onClick={() => onChartModeChange("candles")}>Candlestick</button>
  ),
}));

let root: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

function mount(current: number, historical: boolean) {
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

function differenceText() {
  const span = root!.root
    .findAllByType("span")
    .find((node) =>
      node.children.some(
        (child) => typeof child === "string" && child.includes("$0.96"),
      ),
    );
  expect(span).toBeDefined();
  return span!.children.filter((child) => typeof child === "string").join("");
}

it.each([false, true])(
  "renders adaptive percentages in line and candle charts (historical=%s)",
  (historical) => {
    mount(82423.03, historical);
    expect(differenceText()).toContain("−$0.96 (−0.0012%)");
    act(() => root!.root.findByType("button").props.onClick());
    expect(differenceText()).toContain("−$0.96 (−0.0012%)");
    expect(differenceText()).not.toContain("0.00%");
  },
);

it("retains the positive sign for a small increase", () => {
  mount(82424.95, false);
  expect(differenceText()).toContain("+$0.96 (+0.0012%)");
});

it.each([false, true])(
  "shows an equal price as neutral without a direction (historical=%s)",
  (historical) => {
    mount(82423.99, historical);
    const difference = root!.root
      .findAllByType("span")
      .find((node) =>
        node.children.some(
          (child) => typeof child === "string" && child.includes("$0.00"),
        ),
      )!;
    expect(difference.props.className).toContain("oui-text-base-contrast-54");
    expect(difference.findAllByType("i")).toHaveLength(0);
  },
);

it("passes both original prices into the shared precision formatter", () => {
  mount(82423.991, true);
  expect(formatterArgs).toHaveBeenLastCalledWith(
    "PERP_BTC_USDC",
    82423.99,
    82423.991,
  );
});
