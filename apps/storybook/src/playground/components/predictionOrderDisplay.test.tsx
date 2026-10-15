import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { toPredictionOrder } from "@orderly.network/prediction/src/prediction/binary/binaryOrderDisplay";
import { PredictionOrderSymbol } from "@orderly.network/prediction/src/prediction/cells/cells.ui";
import { matchesPredictionOrderFilters } from "@orderly.network/prediction/src/prediction/dataPanels/orders/matchesPredictionOrderFilters";
import { PredictionOrderCell } from "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrderCell.ui";
import { MobilePredictionOrderCard } from "@orderly.network/prediction/src/prediction/dataPanels/predictionMobileCards.ui";
import type { PredictionAccountPanelState } from "@orderly.network/prediction/src/prediction/prediction.types";
import { usePredictionFilters } from "@orderly.network/prediction/src/prediction/predictionFilters.script";
import { OrderSide, OrderStatus, type API } from "@orderly.network/types";

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
  });
  return {
    parseNumber,
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
    const order = toPredictionOrder(
      apiOrder({ side, reduce_only: reduceOnly }),
    );
    mount(<PredictionOrderCell state={state} order={order} field="side" />);
    expect(text(root.toJSON())).toContain(
      `common.${action} prediction.${outcome}`,
    );
    expect(text(root.toJSON()).includes("orderEntry.reduceOnly")).toBe(
      reduceOnly,
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
    const marker = root.root.findByProps({ "aria-label": `common.${action}` });
    expect(marker.props.title).toBe(`common.${action}`);
    expect(marker.props.className).toContain(
      action === "buy" ? "oui-bg-trade-profit" : "oui-bg-trade-loss",
    );
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
    const order = toPredictionOrder(
      apiOrder({ side, price, average_executed_price: price }),
    );
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

it("UP/DOWN filters match closing shares while Buy/Sell filters match the displayed action", () => {
  let filters: ReturnType<typeof usePredictionFilters>;
  function Consumer() {
    filters = usePredictionFilters();
    return null;
  }
  mount(<Consumer />);
  const upClose = toPredictionOrder(apiOrder());
  const downClose = toPredictionOrder(apiOrder({ side: OrderSide.BUY }));
  const buyDown = toPredictionOrder(apiOrder({ reduce_only: false }));
  const buyUp = toPredictionOrder(
    apiOrder({ side: OrderSide.BUY, reduce_only: false }),
  );
  act(() => {
    filters.onFilter({ name: "outcome", value: "up" });
  });
  expect(matchesPredictionOrderFilters(filters!, upClose)).toBe(true);
  expect(matchesPredictionOrderFilters(filters!, downClose)).toBe(false);
  act(() => {
    filters.onFilter({ name: "outcome", value: "down" });
  });
  expect(matchesPredictionOrderFilters(filters!, upClose)).toBe(false);
  expect(matchesPredictionOrderFilters(filters!, downClose)).toBe(true);
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
