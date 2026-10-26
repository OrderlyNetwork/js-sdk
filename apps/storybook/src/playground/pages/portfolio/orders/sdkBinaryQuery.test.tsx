import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useBinaryOrderRows } from "@orderly.network/prediction/src/prediction/dataPanels/orders/useBinaryOrderRows";
import { OrderSide, OrderStatus, OrderType } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  rows: [] as any[],
  total: 0,
  hasMore: true,
  query: vi.fn(),
  loadMore: vi.fn(),
}));
vi.mock("@orderly.network/hooks", () => ({
  useOrderStream: (...args: any[]) => {
    mocks.query(...args);
    return [
      mocks.rows,
      {
        meta: { total: mocks.total },
        hasMore: mocks.hasMore,
        loadMore: mocks.loadMore,
      },
    ];
  },
}));

let root: ReactTestRenderer;
let result: ReturnType<typeof useBinaryOrderRows>;
function mount(options: Parameters<typeof useBinaryOrderRows>[0]) {
  function Harness() {
    result = useBinaryOrderRows(options);
    return null;
  }
  act(() => {
    root = create(createElement(Harness));
  });
}
const order = (id: number, status = OrderStatus.CANCELLED, quantity = 40) => ({
  order_id: id,
  symbol: "PERP_ETH15M2610091200_USDC",
  side: OrderSide.SELL,
  type: OrderType.MARKET,
  price: 0.7,
  quantity: 100,
  total_executed_quantity: quantity,
  average_executed_price: 0.8,
  created_time: 1791547200000,
  status,
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.rows = [];
  mocks.total = 0;
  mocks.hasMore = true;
});
afterEach(() => {
  if (root) act(() => root.unmount());
});

it.each([
  ["pending", undefined, OrderStatus.INCOMPLETE],
  ["history", undefined, undefined],
  ["history", OrderStatus.CANCELLED, OrderStatus.CANCELLED],
  ["history", OrderStatus.REJECTED, OrderStatus.REJECTED],
  ["filled", OrderStatus.FILLED, undefined],
])(
  "queries BINARY with the appropriate status for %s / %s",
  (mode, status, expected) => {
    const dateRange = {
      from: new Date("2026-07-15"),
      to: new Date("2026-10-12"),
    };
    mount({
      mode: mode as any,
      status: status as any,
      side: OrderSide.SELL,
      dateRange,
    });
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({
        productType: "BINARY",
        size: 50,
        sourceTypeAll: mode !== "pending",
        status: expected,
        dateRange: mode === "history" ? dateRange : undefined,
      }),
      { enabled: true, stopOnUnmount: true },
    );
    // Display Buy/Sell cannot be queried server-side (no reduce_only param);
    // the request must stay side-agnostic so no display side is missed.
    expect(mocks.query.mock.calls[0][0].side).toBeUndefined();
  },
);

it("filters rows by display side locally without querying side", () => {
  mocks.rows = [
    order(1), // SELL + no reduce-only → Buy DOWN
    { ...order(2), reduce_only: true }, // SELL + reduce-only → Sell UP
    { ...order(3), side: OrderSide.BUY, reduce_only: true }, // Sell DOWN
    { ...order(4), side: OrderSide.BUY }, // Buy UP
  ];
  mount({ mode: "history", side: OrderSide.SELL });
  expect(mocks.query.mock.calls[0][0].side).toBeUndefined();
  expect(result.rows.map((row) => row.order_id)).toEqual([2, 3]);
});

it("shows executed cancelled IOC orders, excludes working and unfilled orders and leaked Perps rows", () => {
  mocks.rows = [
    order(1),
    order(2, OrderStatus.FILLED, 100),
    order(3, OrderStatus.CANCELLED, 0),
    order(4, OrderStatus.PARTIAL_FILLED, 10),
    { ...order(5), symbol: "PERP_ETH_USDC" },
  ];
  mount({ mode: "filled" });
  expect(result.rows.map((row) => row.order_id)).toEqual([1, 2]);
  expect(result.rows[0].total_executed_quantity).toBe(40);
  expect(result.rows[0]).toBe(mocks.rows[0]);
});

it("does not truncate loaded order history at 100 and stops once the paginated query ends", () => {
  mocks.rows = Array.from({ length: 150 }, (_, id) => order(id));
  mocks.total = 151;
  mocks.hasMore = false;
  mount({ mode: "history" });
  expect(result.rows).toHaveLength(150);
  expect(result.hasMore).toBe(false);
});

it("suspends and hides cached Binary rows when disabled", () => {
  mocks.rows = [order(1)];
  mocks.total = 2;
  mount({ mode: "history", enabled: false });
  expect(mocks.query).toHaveBeenCalledWith(expect.anything(), {
    enabled: false,
    stopOnUnmount: true,
  });
  expect(result.rows).toEqual([]);
  expect(result.hasMore).toBe(false);
});
