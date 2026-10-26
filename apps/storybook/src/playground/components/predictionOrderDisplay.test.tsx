import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { PredictionOrderSymbol } from "@orderly.network/prediction/src/prediction/cells/cells.ui";
import { PredictionFilters } from "@orderly.network/prediction/src/prediction/dataPanels/filters/predictionFilters.ui";
import { matchesPredictionOrderFilters } from "@orderly.network/prediction/src/prediction/dataPanels/orders/matchesPredictionOrderFilters";
import { PredictionOrderCell } from "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrderCell.ui";
import { MobilePredictionOrderCard } from "@orderly.network/prediction/src/prediction/dataPanels/predictionMobileCards.ui";
import type { PredictionAccountPanelState } from "@orderly.network/prediction/src/prediction/prediction.types";
import { usePredictionFilters } from "@orderly.network/prediction/src/prediction/predictionFilters.script";
import { OrderSide, OrderStatus, type API } from "@orderly.network/types";

const { dataFilter } = vi.hoisted(() => ({ dataFilter: vi.fn(() => null) }));

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  i18n: { t: (key: string) => key },
}));
vi.mock("@orderly.network/ui", async () => {
  const { parseNumber } =
    await import("@orderly.network/ui/src/typography/utils");
  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  );
  const Text = Object.assign(wrapper, {
    numeral: wrapper,
    formatted: wrapper,
    gradient: wrapper,
  });
  return {
    parseNumber,
    DataFilter: dataFilter,
    Badge: wrapper,
    Button: wrapper,
    Text,
    Divider: () => null,
    EmptyDataState: () => null,
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
  };
});
vi.mock("@orderly.network/ui-orders", () => ({
  EditableCellInput: () => null,
  OrderEditConfirmation: () => null,
}));
vi.mock("@orderly.network/ui-connector", () => ({
  useAuthGuard: () => true,
  AuthGuardEmpty: () => null,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionShared",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    usePredictionFormatters: () => ({
      formatRoundBadge: () => "round",
      formatTableTime: () => "time",
    }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/orderEntry/sellPosition",
  () => ({
    SellPosition: () => null,
  }),
);

const state = { isRegionRestricted: false } as PredictionAccountPanelState;
const apiOrder = (changes: Partial<API.Order> = {}) =>
  ({
    order_id: 9686023012,
    symbol: "PERP_BTC5M2610140110_USDC",
    type: "SETTLEMENT",
    side: OrderSide.SELL,
    reduce_only: true,
    price: 1,
    average_executed_price: 1,
    quantity: 13.82,
    total_executed_quantity: 13.82,
    status: OrderStatus.FILLED,
    created_time: 1791940562922,
    ...changes,
  }) as API.Order;
let root: ReactTestRenderer;
function mount(element: React.ReactElement) {
  act(() => {
    root = create(element);
  });
}
function text(node: ReturnType<ReactTestRenderer["toJSON"]>): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(text).join(" ");
  return (node.children ?? []).map(text).join(" ");
}
afterEach(() => {
  act(() => root?.unmount());
});

it.each([
  [OrderSide.BUY, false, "buy", "up"],
  [OrderSide.SELL, false, "buy", "down"],
  [OrderSide.SELL, true, "sell", "up"],
  [OrderSide.BUY, true, "sell", "down"],
] as const)(
  "desktop and mobile show %s reduce-only=%s as %s %s",
  (side, reduceOnly, action, outcome) => {
    const order = apiOrder({ side, reduce_only: reduceOnly });
    mount(<PredictionOrderCell state={state} order={order} field="side" />);
    expect(text(root.toJSON())).toContain(
      `common.${action} prediction.${outcome}`,
    );
    act(() => {
      root.update(<MobilePredictionOrderCard state={state} order={order} />);
    });
    expect(text(root.toJSON())).toContain(`common.side common.${action}`);
    expect(text(root.toJSON())).toContain(
      `prediction.outcome prediction.${outcome}`,
    );
    act(() => {
      root.update(<PredictionOrderSymbol order={order} />);
    });
    const marker = root.root.findByProps({
      "aria-label": `prediction.${outcome}`,
    });
    expect(marker.props.title).toBe(`prediction.${outcome}`);
    expect(marker.props.className).toContain(
      outcome === "up" ? "oui-bg-trade-profit" : "oui-bg-trade-loss",
    );
    act(() =>
      root.update(
        <PredictionOrderCell state={state} order={order} field="reduce_only" />,
      ),
    );
    expect(text(root.toJSON())).toBe(reduceOnly ? "common.yes" : "common.no");
  },
);

it.each([
  [OrderSide.SELL, 1, "1", "13.82"],
  [OrderSide.SELL, 0, "0", "0.00"],
  [OrderSide.BUY, 0, "1", "13.82"],
  [OrderSide.BUY, 1, "0", "0.00"],
] as const)(
  "settlement cells retain actual amounts for %s at UP price %s",
  (side, price, average, notional) => {
    const order = apiOrder({ side, price, average_executed_price: price });
    mount(
      <PredictionOrderCell
        state={state}
        order={order}
        field="average_executed_price"
      />,
    );
    expect(text(root.toJSON())).toBe(average);
    for (const field of ["executed", "notional"]) {
      act(() => {
        root.update(
          <PredictionOrderCell state={state} order={order} field={field} />,
        );
      });
      expect(text(root.toJSON())).toBe(notional);
    }
    act(() => {
      root.update(<MobilePredictionOrderCard state={state} order={order} />);
    });
    expect(text(root.toJSON())).toContain(`prediction.avgFillPrice ${average}`);
    expect(text(root.toJSON())).toContain(`prediction.orderValue ${notional}`);
  },
);

it("orders ignore outcome changes while Buy/Sell filters match the displayed action", () => {
  let filters: ReturnType<typeof usePredictionFilters>;
  function Consumer() {
    filters = usePredictionFilters();
    return null;
  }
  mount(<Consumer />);
  const upClose = apiOrder();
  const downClose = apiOrder({ side: OrderSide.BUY });
  const buyDown = apiOrder({ reduce_only: false });
  const buyUp = apiOrder({ side: OrderSide.BUY, reduce_only: false });
  act(() => {
    filters.onFilter({ name: "outcome", value: "up" });
  });
  expect(matchesPredictionOrderFilters(filters!, upClose)).toBe(true);
  expect(matchesPredictionOrderFilters(filters!, downClose)).toBe(true);
  expect(filters!.outcome).toBe("all");
  act(() => {
    filters.onFilter({ name: "outcome", value: "down" });
  });
  expect(matchesPredictionOrderFilters(filters!, upClose)).toBe(true);
  expect(matchesPredictionOrderFilters(filters!, downClose)).toBe(true);
  expect(filters!.outcome).toBe("all");
  act(() => {
    filters.onFilter({ name: "outcome", value: "all" });
    filters.onFilter({ name: "side", value: "buy" });
  });
  // Buy covers Buy UP and Buy DOWN; a Buy DOWN order's underlying SELL side
  // must not exclude it (QA OR-7529: the Sell filter used to show Buy DOWN).
  expect(matchesPredictionOrderFilters(filters!, buyDown)).toBe(true);
  expect(matchesPredictionOrderFilters(filters!, buyUp)).toBe(true);
  expect(matchesPredictionOrderFilters(filters!, upClose)).toBe(false);
  expect(matchesPredictionOrderFilters(filters!, downClose)).toBe(false);
  act(() => {
    filters.onFilter({ name: "side", value: "sell" });
  });
  expect(matchesPredictionOrderFilters(filters!, upClose)).toBe(true);
  expect(matchesPredictionOrderFilters(filters!, downClose)).toBe(true);
  expect(matchesPredictionOrderFilters(filters!, buyDown)).toBe(false);
  expect(matchesPredictionOrderFilters(filters!, buyUp)).toBe(false);
});

it.each(["holdings", "pending", "filled", "history", "settlements"] as const)(
  "only position history exposes the outcome select: %s",
  (mode) => {
    let filters: ReturnType<typeof usePredictionFilters>;
    function Consumer() {
      filters = usePredictionFilters(false, mode === "settlements");
      return <PredictionFilters filters={filters} mode={mode} />;
    }
    mount(<Consumer />);
    const items = root.root.findByType(dataFilter).props.items;
    const outcome = items.find(
      (item: { name: string }) => item.name === "outcome",
    );
    if (mode !== "settlements") {
      expect(outcome).toBeUndefined();
      return;
    }
    expect(
      outcome.options.map((option: { value: string }) => option.value),
    ).toEqual(["all", "up", "down", "tie"]);
    for (const selected of ["up", "down", "tie", "all"]) {
      act(() => filters.onFilter({ name: "outcome", value: selected }));
      for (const result of ["up", "down", "tie", ""]) {
        expect(filters!.matches({ outcome: result })).toBe(
          selected === "all" || selected === result,
        );
      }
    }
  },
);
