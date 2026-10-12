import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import {
  binaryRowRoundStart,
  type BinaryInfoRow,
} from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { RoundNavigator } from "@orderly.network/prediction/src/prediction/roundNavigator.ui";

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  AssetIcon: () => <svg />,
  BarChartIcon: () => <svg />,
  CaretDownIcon: () => <svg data-direction="down" />,
  CaretUpIcon: () => <svg data-direction="up" />,
  cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
  PopoverRoot: ({ children, open, onOpenChange }: any) => (
    <section data-open={open} {...({ onOpenChange } as any)}>
      {children}
    </section>
  ),
  PopoverTrigger: ({ children }: any) => children,
  PopoverContent: ({ children }: any) => <article>{children}</article>,
  Tooltip: ({ children }: any) => children,
  useMediaQuery: () => true,
}));
vi.mock("@orderly.network/prediction/src/prediction/predictionShared", () => ({
  formatCountdown: () => "00:00",
  formatCountdownWithHours: () => "00:00",
  usePredictionFormatters: () => ({
    chart: {
      roundTimeFormatter: new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
      roundLabelFormatter: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      }),
      resolutionLocalFormatter: new Intl.DateTimeFormat("en"),
      resolutionUtcFormatter: new Intl.DateTimeFormat("en"),
    },
  }),
}));

const t0 = new Date(2026, 9, 12, 0, 10).getTime();
const rows: BinaryInfoRow[] = Array.from({ length: 8 }, (_, index) => {
  const start = t0 + (index - 6) * 300_000;
  return {
    symbol: `PERP_BTC5M${new Date(start).toISOString().replace(/[-:T]/g, "").slice(2, 12)}_USDC`,
    product_type: "BINARY",
    fee_model: "BINARY_PROBABILITY",
    status: "ACTIVE",
    activated_at: start - 60_000,
    observation_start_at: start,
    expire_at: start + 300_000,
    index_price_symbol: "PERP_BTC_USDC",
    s0: 68000,
    outcome: index % 2 === 0 ? "UP" : "DOWN",
  };
});
let root: ReactTestRenderer | undefined;
afterEach(() => {
  if (root) act(() => root!.unmount());
  root = undefined;
});
function mount() {
  const onRoundChange = vi.fn();
  act(() => {
    root = create(
      <RoundNavigator
        round={t0 / 1000}
        selectedRound={t0 / 1000}
        intervalSeconds={300}
        now={t0 + 1}
        rows={[...rows].reverse()}
        chartMode="price"
        onChartModeChange={vi.fn()}
        onRoundChange={onRoundChange}
        roundOutcome={(round) => {
          const row = rows.find((item) => binaryRowRoundStart(item) === round);
          return row?.outcome === "UP" ? "up" : "down";
        }}
      />,
    );
  });
  return onRoundChange;
}

it("lists past rounds newest first across dates with colored circular outcomes", () => {
  const onRoundChange = mount();
  const past = root!.root.findAllByType("section")[0];
  act(() => past.props.onOpenChange(true));
  const menuButtons = past.findByType("article").findAllByType("button");
  expect(menuButtons.map((button) => button.children.at(-1))).toEqual([
    "00:10 prediction.rounds.today",
    "00:05 prediction.rounds.today",
    "00:00 prediction.rounds.today",
    "23:55 Oct 11",
    "23:50 Oct 11",
    "23:45 Oct 11",
  ]);
  for (const [index, button] of menuButtons.entries()) {
    const icon = button.findByType("span");
    expect(icon.props.className).toContain("oui-rounded-full");
    expect(icon.props.className).toContain(
      index % 2 === 0 ? "oui-text-trade-loss" : "oui-text-trade-profit",
    );
    expect(icon.props.className).toContain(
      index % 2 === 0 ? "oui-bg-trade-loss/15" : "oui-bg-trade-profit/15",
    );
  }
  act(() => menuButtons[0].props.onClick());
  expect(onRoundChange).toHaveBeenCalledWith(binaryRowRoundStart(rows[5]));
  expect(past.props["data-open"]).toBe(false);
});

it("each recent outcome selects its own round without opening Past", () => {
  const onRoundChange = mount();
  const past = root!.root.findAllByType("section")[0];
  const shortcuts = past.findAll(
    (node) =>
      node.type === "button" &&
      node.props.className?.includes(
        "oui-prediction-roundNavigator-result-btn",
      ),
  );
  expect(shortcuts).toHaveLength(4);
  shortcuts.forEach((button, index) => {
    expect(button.findAllByType("button")).toHaveLength(1);
    expect(button.parent?.type).not.toBe("button");
    expect(button.props["aria-label"]).toBeTruthy();
    act(() => button.props.onClick());
    expect(onRoundChange).toHaveBeenLastCalledWith(
      binaryRowRoundStart(rows[index + 1]),
    );
    expect(past.props["data-open"]).toBe(false);
  });
});
