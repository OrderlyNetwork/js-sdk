import { act, cleanup, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AlgoOrderRootType,
  API,
  OrderStatus,
  OrderType,
} from "@orderly.network/types";
import { getOrderExecutionReportMsg } from "./getOrderExecutionReportMsg";
import { useExecutionReport } from "./useExecutionReport";

const mocks = vi.hoisted(() => {
  const listeners = new Set<(data: unknown) => void>();
  return {
    accountId: "account-a" as string | undefined,
    baseDp: 2 as number | undefined,
    brokers: {},
    listeners,
    ee: {
      on: vi.fn((_event: string, handler: (data: unknown) => void) => {
        listeners.add(handler);
      }),
      off: vi.fn((_event: string, handler: (data: unknown) => void) => {
        listeners.delete(handler);
      }),
    },
    play: vi.fn(),
    toast: vi.fn(),
    t: vi.fn<(key: string, options?: Record<string, unknown>) => string>(
      (key) => key,
    ),
  };
});

vi.mock("@orderly.network/hooks", () => ({
  useAccount: () => ({ state: { accountId: mocks.accountId } }),
  useEventEmitter: () => mocks.ee,
  useSymbolsInfo: () =>
    new Proxy(
      {},
      {
        get: () => (field: string) => (field === "base_dp" ? mocks.baseDp : 2),
      },
    ),
  useOrderlyContext: () => ({ notification: undefined }),
  useAllBrokers: () => [mocks.brokers],
  useLocalStorage: (_key: string, value: unknown) => [value],
  // A changing play callback must not reset pending order notifications.
  useAudioPlayer: () => ({ play: () => mocks.play() }),
  formatSymbolWithBroker: (symbol: string) => symbol,
}));

vi.mock("@orderly.network/i18n", () => ({
  i18n: { t: mocks.t },
}));

vi.mock("@orderly.network/ui", async () => {
  const { Decimal } = await import("@orderly.network/utils");
  return {
    toast: { success: mocks.toast },
    parseNumber: (value: number, { dp }: { dp: number }) =>
      new Decimal(value).toFixed(dp, Decimal.ROUND_DOWN),
  };
});

const predictionSymbol = "PERP_BTC5M2610151415_USDC";
const perpSymbol = "PERP_BTC_USDC";

const order = (overrides: Partial<API.Order> = {}): API.Order => ({
  symbol: predictionSymbol,
  order_id: 9705971206,
  client_order_id: "",
  user_id: 1,
  type: OrderType.IOC,
  side: "BUY",
  quantity: 16.94,
  price: 0.59,
  status: OrderStatus.CANCELLED,
  total_executed_quantity: 11.34,
  average_executed_price: 0.54,
  total_fee: 0.001691,
  fee_asset: "USDC",
  amount: null,
  visible: 16.94,
  executed: 0,
  visible_quantity: 16.94,
  created_time: 1792073028210,
  updated_time: 1792073028216,
  reduce_only: false,
  ...overrides,
});

const algoOrder = (overrides: Partial<API.AlgoOrder> = {}): API.AlgoOrder => ({
  algo_order_id: 9705971206,
  root_algo_order_id: 9705971206,
  parent_algo_order_id: 0,
  parent_algo_type: AlgoOrderRootType.TRAILING_STOP,
  symbol: perpSymbol,
  algo_type: AlgoOrderRootType.TRAILING_STOP,
  child_orders: [],
  type: OrderType.LIMIT,
  side: "BUY",
  quantity: 16.94,
  algo_status: OrderStatus.NEW,
  root_algo_status: OrderStatus.NEW,
  is_triggered: false,
  is_activated: false,
  trigger_price: 0.59,
  trigger_price_type: "MARK_PRICE",
  total_executed_quantity: 0,
  visible_quantity: 16.94,
  total_fee: 0,
  fee_asset: "USDC",
  reduce_only: false,
  created_time: 1792073028210,
  updated_time: 1792073028216,
  ...overrides,
});

type Report = Parameters<typeof getOrderExecutionReportMsg>[0];

const emit = (data: Report) => {
  act(() => mocks.listeners.forEach((listener) => listener(data)));
};

const advance = (ms: number) => {
  act(() => vi.advanceTimersByTime(ms));
};

const format = (data: Report, dp: number | undefined = 2) =>
  getOrderExecutionReportMsg(data, { [data.symbol]: () => dp }, data.symbol);

const expectPartialCancellation = (
  symbol: string,
  quantities = { filled: "11.34", quantity: "16.94", canceled: "5.60" },
) => {
  expect(mocks.t).toHaveBeenCalledWith(
    "orders.status.partialFilledCanceled.toast.description",
    { side: "common.buy", symbol, ...quantities },
  );
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mocks.listeners.clear();
  mocks.accountId = "account-a";
  mocks.baseDp = 2;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("IOC execution report messages", () => {
  it.each([predictionSymbol, perpSymbol])(
    "describes the filled and canceled quantities for %s without changing status",
    (symbol) => {
      expect(format(order({ symbol }))).toMatchObject({
        title: "orders.status.partialFilledCanceled.toast.title",
        msg: "orders.status.partialFilledCanceled.toast.description",
        status: OrderStatus.CANCELLED,
        hasFill: true,
      });
      expectPartialCancellation(symbol);
    },
  );

  it("subtracts quantities exactly before formatting the remainder", () => {
    format(order({ quantity: 0.3, total_executed_quantity: 0.1 }));
    expectPartialCancellation(predictionSymbol, {
      filled: "0.10",
      quantity: "0.30",
      canceled: "0.20",
    });
  });

  it("retains precision when symbol decimal places are unavailable", () => {
    getOrderExecutionReportMsg(
      order({ quantity: 0.3, total_executed_quantity: 0.1 }),
      { [predictionSymbol]: () => undefined },
      predictionSymbol,
    );
    expect(mocks.t).toHaveBeenCalledWith(
      "orders.status.partialFilledCanceled.toast.description",
      {
        side: "common.buy",
        symbol: predictionSymbol,
        filled: 0.1,
        quantity: 0.3,
        canceled: 0.2,
      },
    );
  });

  it("preserves the canceled message when there were no fills", () => {
    expect(format(order({ total_executed_quantity: 0 }))).toMatchObject({
      title: "orders.status.canceled.toast.title",
      msg: `common.buy ${predictionSymbol} 16.94`,
      hasFill: false,
    });
  });

  it.each([OrderType.LIMIT, OrderType.MARKET])(
    "preserves partial cancellation messages for non-IOC %s orders",
    (type) => {
      expect(format(order({ type }))).toMatchObject({
        title: "orders.status.canceled.toast.title",
        hasFill: false,
      });
    },
  );

  it.each([OrderStatus.FILLED, OrderStatus.PARTIAL_FILLED])(
    "preserves %s messages and their fill signal",
    (status) => {
      expect(format(order({ status }))).toMatchObject({
        title: "orders.status.filled.toast.title",
        msg: `common.buy ${predictionSymbol} 11.34 / 16.94`,
        hasFill: true,
      });
    },
  );

  it("does not apply the regular IOC message to algorithm orders", () => {
    expect(
      format(
        algoOrder({
          type: OrderType.IOC,
          algo_status: OrderStatus.CANCELLED,
          total_executed_quantity: 11.34,
        }),
      ),
    ).toMatchObject({
      title: "orders.status.canceled.toast.title",
      hasFill: false,
    });
  });
});

describe("execution report notifications", () => {
  it.each([predictionSymbol, perpSymbol])(
    "coalesces NEW, PARTIAL_FILLED and CANCELLED for %s and plays one fill sound",
    (symbol) => {
      renderHook(() => useExecutionReport());
      emit(
        order({ symbol, status: OrderStatus.NEW, total_executed_quantity: 0 }),
      );
      emit(order({ symbol, status: OrderStatus.PARTIAL_FILLED }));
      advance(5);
      emit(order({ symbol }));
      advance(99);
      expect(mocks.toast).not.toHaveBeenCalled();
      advance(1);

      expect(mocks.toast).toHaveBeenCalledTimes(1);
      expect(mocks.play).toHaveBeenCalledTimes(1);
      expectPartialCancellation(symbol);
      const notification = render(mocks.toast.mock.calls[0][0]);
      expect(notification.container.textContent).toContain(
        "orders.status.partialFilledCanceled.toast.title",
      );
    },
  );

  it("recognizes a fill from the final cancellation report alone", () => {
    renderHook(() => useExecutionReport());
    emit(order());
    advance(100);
    expectPartialCancellation(predictionSymbol);
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it("does not play a fill sound for a zero-fill cancellation", () => {
    renderHook(() => useExecutionReport());
    emit(order({ total_executed_quantity: 0 }));
    advance(100);
    expect(mocks.toast).toHaveBeenCalledTimes(1);
    expect(mocks.play).not.toHaveBeenCalled();
  });

  it("shows a fully filled IOC order and plays its sound", () => {
    renderHook(() => useExecutionReport());
    emit(order({ status: OrderStatus.FILLED, total_executed_quantity: 16.94 }));
    advance(100);
    const notification = render(mocks.toast.mock.calls[0][0]);
    expect(notification.container.textContent).toContain("16.94 / 16.94");
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it("uses independent timers and toast IDs for interleaved orders of the same type", () => {
    renderHook(() => useExecutionReport());
    emit(order());
    advance(50);
    emit(order({ order_id: 2 }));
    advance(30);
    emit(order({ total_executed_quantity: 12 }));
    advance(70);
    expect(mocks.toast).toHaveBeenCalledTimes(1);
    const secondId = mocks.toast.mock.calls[0][1].id;
    advance(30);
    expect(mocks.toast).toHaveBeenCalledTimes(2);
    const firstId = mocks.toast.mock.calls[1][1].id;
    expect(firstId).not.toBe(secondId);
    expectPartialCancellation(predictionSymbol, {
      filled: "12.00",
      quantity: "16.94",
      canceled: "4.94",
    });
  });

  it("updates the same toast when an order changes after the aggregation window", () => {
    const { rerender } = renderHook(() => useExecutionReport());
    emit(order({ status: OrderStatus.PARTIAL_FILLED }));
    advance(100);
    expect(mocks.play).toHaveBeenCalledTimes(1);
    rerender();
    emit(order());
    advance(100);
    expect(mocks.toast).toHaveBeenCalledTimes(2);
    expect(mocks.toast.mock.calls[0][1].id).toBe(
      mocks.toast.mock.calls[1][1].id,
    );
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it.each([predictionSymbol, perpSymbol])(
    "plays again only when the notified cumulative fill increases for %s",
    (symbol) => {
      renderHook(() => useExecutionReport());
      emit(order({ symbol, status: OrderStatus.PARTIAL_FILLED }));
      advance(100);
      expect(mocks.play).toHaveBeenCalledTimes(1);

      emit(
        order({
          symbol,
          status: OrderStatus.PARTIAL_FILLED,
          total_executed_quantity: 12,
        }),
      );
      advance(100);
      expect(mocks.play).toHaveBeenCalledTimes(2);

      // A delayed report must not lower the remembered cumulative quantity.
      emit(order({ symbol, status: OrderStatus.PARTIAL_FILLED }));
      advance(100);
      expect(mocks.play).toHaveBeenCalledTimes(2);

      emit(order({ symbol, total_executed_quantity: 12 }));
      advance(100);
      expect(mocks.play).toHaveBeenCalledTimes(2);

      emit(order({ symbol, total_executed_quantity: 12.34 }));
      advance(100);
      expect(mocks.play).toHaveBeenCalledTimes(3);
    },
  );

  it("does not replay the sound for duplicate final cancellations", () => {
    renderHook(() => useExecutionReport());
    emit(order());
    advance(100);
    emit(order());
    advance(100);
    expect(mocks.toast).toHaveBeenCalledTimes(2);
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it("tracks fill sounds independently for regular and algorithm orders", () => {
    renderHook(() => useExecutionReport());
    emit(order());
    emit(
      algoOrder({
        algo_status: OrderStatus.FILLED,
        total_executed_quantity: 11.34,
      }),
    );
    advance(100);
    expect(mocks.play).toHaveBeenCalledTimes(2);
  });

  it("preserves algorithm fill sounds when the root has no cumulative fill quantity", () => {
    renderHook(() => useExecutionReport());
    emit(algoOrder({ algo_status: OrderStatus.FILLED }));
    advance(100);
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it("keeps regular and algorithm orders with the same numeric ID separate", () => {
    renderHook(() => useExecutionReport());
    emit(order());
    emit(algoOrder());
    advance(100);
    expect(mocks.toast).toHaveBeenCalledTimes(2);
    expect(mocks.toast.mock.calls[0][1].id).not.toBe(
      mocks.toast.mock.calls[1][1].id,
    );
  });

  it("does not merge reports without an order ID", () => {
    renderHook(() => useExecutionReport());
    const anonymous = order();
    Reflect.deleteProperty(anonymous, "order_id");
    emit(anonymous);
    emit(anonymous);
    advance(100);
    expect(mocks.toast).toHaveBeenCalledTimes(2);
    expect(mocks.toast.mock.calls[0][1].id).not.toBe(
      mocks.toast.mock.calls[1][1].id,
    );
  });

  it("clears pending reports on account changes and namespaces subsequent toasts", () => {
    const { rerender } = renderHook(() => useExecutionReport());
    emit(order());
    advance(100);
    const oldId = mocks.toast.mock.calls[0][1].id;
    mocks.toast.mockClear();
    mocks.play.mockClear();
    emit(order());
    mocks.accountId = "account-b";
    rerender();
    advance(100);
    expect(mocks.toast).not.toHaveBeenCalled();
    expect(mocks.play).not.toHaveBeenCalled();

    emit(order());
    advance(100);
    expect(mocks.toast).toHaveBeenCalledTimes(1);
    expect(mocks.toast.mock.calls[0][1].id).not.toBe(oldId);
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it("does not subscribe without an account and clears pending work on logout", () => {
    mocks.accountId = undefined;
    const { rerender } = renderHook(() => useExecutionReport());
    expect(mocks.listeners.size).toBe(0);
    mocks.accountId = "account-a";
    rerender();
    emit(order());
    mocks.accountId = undefined;
    rerender();
    advance(100);
    expect(mocks.toast).not.toHaveBeenCalled();
    expect(mocks.listeners.size).toBe(0);
  });

  it("cancels all pending timers and removes its listener on unmount", () => {
    const { unmount } = renderHook(() => useExecutionReport());
    emit(order());
    emit(order({ order_id: 2 }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(mocks.listeners.size).toBe(0);
    advance(100);
    expect(mocks.toast).not.toHaveBeenCalled();
    expect(mocks.play).not.toHaveBeenCalled();
  });

  it("preserves pending notifications across rerenders and uses the latest symbol precision", () => {
    const { rerender } = renderHook(() => useExecutionReport());
    emit(order());
    advance(50);
    mocks.baseDp = 3;
    rerender();
    advance(50);
    expect(mocks.toast).toHaveBeenCalledTimes(1);
    expectPartialCancellation(predictionSymbol, {
      filled: "11.340",
      quantity: "16.940",
      canceled: "5.600",
    });
  });

  it("preserves trailing-stop activation and suppresses extreme-price-only updates", () => {
    renderHook(() => useExecutionReport());
    const data = algoOrder({
      algo_status: OrderStatus.REPLACED,
      activated_price: 50000,
    });
    emit({
      ...data,
      fieldChanges: {
        [AlgoOrderRootType.TRAILING_STOP]: {
          is_activated: true,
          extreme_price: true,
        },
      },
    });
    advance(100);
    expect(mocks.toast).toHaveBeenCalledTimes(1);
    const notification = render(mocks.toast.mock.calls[0][0]);
    expect(notification.container.textContent).toContain(
      "orders.trailingStop.activated",
    );
    mocks.toast.mockClear();
    emit({
      ...data,
      fieldChanges: {
        [AlgoOrderRootType.TRAILING_STOP]: { extreme_price: true },
      },
    });
    advance(100);
    expect(mocks.toast).not.toHaveBeenCalled();
    expect(mocks.play).not.toHaveBeenCalled();
  });
});
