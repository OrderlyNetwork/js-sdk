import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { normalizeBinaryHistory } from "@orderly.network/prediction/src/prediction/binary/binaryHistory";
import { binaryHistoryDisplayRows } from "@orderly.network/prediction/src/prediction/binary/binarySettlement";
import { RoundSymbol } from "@orderly.network/prediction/src/prediction/cells/cells.ui";
import { PredictionHistoryTableUI } from "@orderly.network/prediction/src/prediction/dataPanels/history/predictionHistoryTable.ui";
import { MobilePredictionHistory } from "@orderly.network/prediction/src/prediction/dataPanels/predictionMobileCards.ui";
import { RoundOrderStatusCard } from "@orderly.network/prediction/src/prediction/orderEntry/roundOrderStatusCard.ui";
import type { PredictionAccountPanelState } from "@orderly.network/prediction/src/prediction/prediction.types";
import { RoundNavigator } from "@orderly.network/prediction/src/prediction/roundNavigator.ui";
import type { API } from "@orderly.network/types";

const view = vi.hoisted(() => ({ records: [] as unknown[] }));
vi.mock("@orderly.network/i18n", () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => {
  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  );
  return {
    Text: Object.assign(wrapper, { numeral: wrapper }),
    Badge: ({
      children,
      color,
    }: React.PropsWithChildren<{ color: string }>) => (
      <span data-tone={color}>{children}</span>
    ),
    Divider: () => null,
    EmptyDataState: () => null,
    Spinner: () => <span>loading</span>,
    cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
    Tooltip: wrapper,
    PopoverRoot: ({
      children,
      onOpenChange,
    }: React.PropsWithChildren<{ onOpenChange: (open: boolean) => void }>) => (
      <section onClick={() => onOpenChange(true)}>{children}</section>
    ),
    PopoverContent: wrapper,
    PopoverTrigger: wrapper,
    CaretDownIcon: () => <svg data-direction="down" />,
    CaretUpIcon: () => <svg data-direction="up" />,
    AssetIcon: () => null,
    BarChartIcon: () => null,
    useMediaQuery: () => true,
    useScreen: () => ({ isMobile: false }),
  };
});
vi.mock("@orderly.network/ui-connector", () => ({
  useAuthGuard: () => true,
  AuthGuardEmpty: () => null,
}));
vi.mock("@orderly.network/prediction/src/prediction/predictionShared", () => ({
  formatPredictionPnl: (value: number) => value.toFixed(2),
  formatCountdown: () => "00:00",
  formatCountdownWithHours: () => "0:00:00",
  usePredictionFormatters: () => ({
    formatRoundBadge: () => "round",
    formatRoundWindow: () => "12:00–12:05",
    formatTableTime: () => "completed time",
    chart: {
      roundTimeFormatter: new Intl.DateTimeFormat("en"),
      roundLabelFormatter: new Intl.DateTimeFormat("en"),
      resolutionLocalFormatter: new Intl.DateTimeFormat("en"),
      resolutionUtcFormatter: new Intl.DateTimeFormat("en"),
    },
  }),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/orderEntry/sellPosition",
  () => ({ SellPosition: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrderCell.ui",
  () => ({ PredictionOrderCell: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/filters/predictionFilters.ui",
  () => ({ PredictionFilters: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/history/predictionHistoryTable.script",
  () => ({
    usePredictionHistoryTableScript: () => ({
      filters: {},
      historyState: { displayRecords: view.records },
    }),
  }),
);
vi.mock("@orderly.network/prediction/src/prediction/dataPanels/table", () => ({
  tableColumn: (title: string) => ({ title }),
  PredictionDataTable: ({
    rows,
  }: {
    rows: { id: string; cells: React.ReactNode[] }[];
  }) => (
    <div>
      {rows.map((row) => (
        <div key={row.id}>
          {row.cells.map((cell, index) => (
            <React.Fragment key={index}>{cell}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const t0 = Date.UTC(2026, 9, 9, 12);
const row: API.BinaryInfoRow = {
  symbol: "PERP_BTC5M2610091200_USDC",
  product_type: "BINARY",
  status: "DELISTING",
  fee_model: "BINARY_PROBABILITY",
  activated_at: t0,
  observation_start_at: t0,
  expire_at: t0 + 300_000,
  index_price_symbol: "PERP_BTC_USDC",
  s0: 100,
  s1: 100,
  outcome: "TIE",
  settlement_price_per_share: 0.5,
  result_committed_at: t0 + 301_000,
};
let root: ReactTestRenderer | undefined;
const mount = (element: React.ReactElement) =>
  act(() => {
    root = create(element);
  });
type RenderedNode =
  | string
  | { children?: RenderedNode[] }
  | RenderedNode[]
  | null
  | undefined;
const text = (node: RenderedNode): string =>
  typeof node === "string"
    ? node
    : Array.isArray(node)
      ? node.map(text).join(" ")
      : text(node?.children ?? []);
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it("renders a neutral tie card and keeps unresolved rounds pending", () => {
  const props = {
    round: t0 / 1000,
    intervalSeconds: 300,
    marketName: "BTC",
    isRoundInSnapshot: true,
  };
  mount(<RoundOrderStatusCard {...props} roundPhase="resolvedTie" />);
  expect(text(root!.toJSON())).toContain("prediction.resolution.tiePayout");
  expect(root!.root.findAllByProps({ className: "oui-text-3xl" })).toHaveLength(
    1,
  );
  expect(root!.root.findAllByType("svg")).toHaveLength(0);
  act(() =>
    root!.update(<RoundOrderStatusCard {...props} roundPhase="closed" />),
  );
  expect(text(root!.toJSON())).toContain(
    "prediction.resolution.determiningWinner",
  );
  expect(text(root!.toJSON())).not.toContain("prediction.resolution.outcome");
});

it.each(["LONG", "SHORT"] as const)(
  "desktop and mobile history retain %s direction alongside the tie result",
  (side) => {
    const short = side === "SHORT";
    view.records = binaryHistoryDisplayRows([
      normalizeBinaryHistory({
        position_id: 1,
        symbol: row.symbol,
        side,
        type: "trade",
        position_status: "closed",
        closed_position_qty: 100,
        avg_open_price: short ? -0.4 : 0.4,
        avg_close_price: short ? -0.5 : 0.5,
        realized_pnl: short ? -10 : 10,
        trading_fee: 0.02,
        open_timestamp: t0,
        close_timestamp: t0 + 310_000,
        last_update_time: t0 + 310_000,
        settled_at: t0 + 310_000,
        outcome: "TIE",
        settlement_price_per_share: 0.5,
      } as API.PositionHistory),
    ]);
    const history = view.records as ReturnType<typeof binaryHistoryDisplayRows>;
    mount(
      <PredictionHistoryTableUI
        displayRecords={history}
        filters={
          {} as React.ComponentProps<typeof PredictionHistoryTableUI>["filters"]
        }
      />,
    );
    for (const mobile of [false, true]) {
      if (mobile)
        act(() =>
          root!.update(
            <MobilePredictionHistory
              state={{} as PredictionAccountPanelState}
            />,
          ),
        );
      // RoundSymbol encodes the held direction in its stripe, while the
      // separate outcome badge displays the final result.
      expect(root!.root.findByType(RoundSymbol).props.outcome).toBe(
        short ? "down" : "up",
      );
      expect(
        root!.root.findAll(
          (node) =>
            node.type === "span" &&
            node.props["aria-hidden"] === "true" &&
            node.props.className
              ?.split(" ")
              .includes(short ? "oui-bg-trade-loss" : "oui-bg-trade-profit"),
        ),
      ).toHaveLength(1);
      expect(text(root!.toJSON())).toContain("prediction.tie");
      expect(text(root!.toJSON())).toContain(short ? "-10.02" : "9.98");
      expect(text(root!.toJSON())).toContain("0.5");
      expect(text(root!.toJSON())).toContain("completed time");
      expect(
        root!.root.findAllByProps({ "data-tone": "neutral" }),
      ).toHaveLength(1);
    }
  },
);

it("historical round navigation renders the tie equality icon", () => {
  mount(
    <RoundNavigator
      round={t0 / 1000}
      selectedRound={t0 / 1000}
      intervalSeconds={300}
      now={t0 + 320_000}
      rows={[row]}
      onRoundChange={vi.fn()}
      chartMode="price"
      onChartModeChange={vi.fn()}
      roundOutcome={() => "tie"}
    />,
  );
  act(() => root!.root.findAllByType("section")[0].props.onClick());
  expect(text(root!.toJSON())).toContain("=");
  const icon = root!.root
    .findAllByType("span")
    .find((node) => node.props.className?.includes("oui-size-5"))!;
  expect(icon.findAllByType("svg")).toHaveLength(0);
  expect(icon.props.className).toContain("oui-text-base-contrast");
});
