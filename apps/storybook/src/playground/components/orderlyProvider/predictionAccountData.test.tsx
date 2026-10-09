import React, { StrictMode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePredictionAccountData } from "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData";
import { AccountStatusEnum } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";

const mocks = vi.hoisted(() => ({
  accountId: "a" as string | undefined,
  status: 5,
  positions: [] as any[],
  rest: undefined as any[] | undefined,
  restReady: true,
  history: undefined as any,
  orders: [] as any[],
  total: 0 as number | undefined,
  validating: false,
  failed: false,
  cache: new Map(),
  refresh: vi.fn(async () => undefined),
  loadMore: vi.fn(),
  privateQuery: vi.fn(),
  orderQuery: vi.fn(),
  query: vi.fn(),
  ws: {
    subscribe: vi.fn(() => () => {}),
    onceSubscribe: vi.fn(() => () => {}),
  },
}));
vi.mock("@orderly.network/i18n", () => ({ i18n: { t: (key: string) => key } }));
vi.mock("@orderly.network/ui", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@orderly.network/hooks", async () => {
  const { useState } = await import("react");
  return {
    useSWRConfig: () => ({ cache: mocks.cache }),
    useMemoizedFn: (
      await vi.importActual<any>(
        "@orderly.network/hooks/src/shared/useMemoizedFn",
      )
    ).useMemoizedFn,
    useRefreshOrderCaches: () => mocks.refresh,
    useAccount: () => ({
      state: { accountId: mocks.accountId, status: mocks.status },
    }),
    useAccountInfo: () => ({
      data: { binary_taker_fee_rate: 6, binary_maker_fee_rate: 0 },
    }),
    useCollateral: () => ({ freeCollateral: 1000 }),
    useLocalStorage: (_key: string, initial: unknown) => useState(initial),
    useMarkPricesStream: () => ({ data: {} }),
    useMutation: () => [vi.fn()],
    useOrderStream: (params: any, options: any) => {
      mocks.orderQuery(params, options);
      return [
        params.status ? mocks.orders : [],
        {
          meta: { total: mocks.total },
          isLoading: false,
          error: mocks.failed ? Error("failed") : undefined,
          isValidating: mocks.validating,
          loadMore: mocks.loadMore,
          refresh: mocks.refresh,
        },
      ];
    },
    // Real position wrappers are also recreated on unrelated renders.
    usePositionStream: () => [
      { rows: mocks.positions.map((row) => ({ ...row })) },
    ],
    usePrivateQuery: (key: string | null) => {
      mocks.privateQuery(key, mocks.accountId);
      return {
        data:
          key === "/v1/positions"
            ? mocks.restReady
              ? { rows: mocks.rest ?? mocks.positions }
              : undefined
            : mocks.history,
        mutate: mocks.refresh,
        isLoading: false,
      };
    },
    useQuery: (key: string | null) => {
      mocks.query(key);
      return { data: undefined };
    },
    useWS: () => mocks.ws,
  };
});
let root: ReactTestRenderer | undefined,
  state: ReturnType<typeof usePredictionAccountData>,
  renders: number;
function Consumer({
  enabled = true,
  includeHistory = true,
}: {
  enabled?: boolean;
  includeHistory?: boolean;
}) {
  state = usePredictionAccountData({ enabled, includeHistory });
  if (++renders > 50) throw Error("Account data did not settle");
  return null;
}
const holding = {
  symbol: "PERP_BTC5M2601010000_USDC",
  position_qty: 2,
  average_open_price: 0.5,
};
function mount(count = 1) {
  act(() => {
    root = create(
      <StrictMode>
        {Array.from({ length: count }, (_, key) => (
          <Consumer key={key} />
        ))}
      </StrictMode>,
    );
  });
}
function update() {
  act(() => {
    root!.update(<Consumer />);
  });
}
async function flush() {
  await act(async () => {});
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", { setTimeout, clearTimeout });
  vi.clearAllMocks();
  mocks.cache.clear();
  mocks.accountId = "a";
  mocks.status = AccountStatusEnum.EnableTrading;
  mocks.positions = [];
  mocks.rest = undefined;
  mocks.restReady = true;
  mocks.history = undefined;
  mocks.orders = [];
  mocks.total = 0;
  mocks.validating = false;
  mocks.failed = false;
  renders = 0;
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Prediction account resources", () => {
  it("settles fresh stream objects without a full page state or any orderbook subscription", () => {
    mount();
    const before = renders;
    update();
    expect(renders - before).toBe(1);
    expect(state.accountReady).toBe(true);
    expect(state).not.toHaveProperty("selectedRow");
    expect(state).not.toHaveProperty("setAmountInput");
    expect(mocks.ws.subscribe).not.toHaveBeenCalled();
    expect(mocks.ws.onceSubscribe).not.toHaveBeenCalled();
  });
  it("explains rejected cancels and edits instead of failing silently", async () => {
    mount();
    await flush();
    // Cancel of an order that is no longer loaded reports the reason.
    await act(async () => {
      await state.cancelOrder(123);
    });
    expect(toast.error).toHaveBeenCalledWith(
      "prediction.message.orderNotFound",
    );
    toast.error.mockClear();
    // Edit without a tradable round config reports the round, not silence.
    await act(async () => {
      await state.editPendingOrder(123, 0.5, 1);
    });
    expect(toast.error).toHaveBeenCalledWith(
      "prediction.message.roundNotTradable",
    );
    expect(mocks.ws.subscribe).not.toHaveBeenCalled();
  });
  it("shares one polling timer; stops on last unmount and validates cached disappeared holdings on remount", async () => {
    mocks.positions = [holding];
    mount(2);
    await flush();
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);
    mocks.positions = [];
    update();
    await flush();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
    act(() => root!.unmount());
    root = undefined;
    expect(vi.getTimerCount()).toBe(0);
    mocks.refresh.mockClear();
    mount();
    await flush();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(mocks.refresh).toHaveBeenCalledTimes(2);
  });
  it("keeps polling disappeared holdings until the delayed personal REST settlement arrives", async () => {
    mocks.positions = [holding];
    mount();
    await flush();
    mocks.positions = [];
    update();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
    mocks.history = {
      accountId: "a",
      rows: [
        {
          position_id: 1,
          symbol: holding.symbol,
          side: "LONG",
          position_status: "closed",
          type: "trade",
          closed_position_qty: 2,
          avg_open_price: 0.5,
          avg_close_price: 1,
          realized_pnl: 1,
          trading_fee: 0,
          open_timestamp: Date.UTC(2026, 0, 1),
          close_timestamp: Date.UTC(2026, 0, 1, 0, 6),
          last_update_time: Date.UTC(2026, 0, 1, 0, 6),
          outcome: "UP",
          settlement_price_per_share: 1,
          settled_at: Date.UTC(2026, 0, 1, 0, 6),
        },
      ],
    };
    update();
    await flush();
    expect(state.pendingSettlementSymbols).toEqual([]);
    mocks.refresh.mockClear();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(mocks.refresh).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(55000);
    });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
  it("never seeds a switched account from the old stream or adds that unchanged stream after its REST response", () => {
    mocks.positions = [holding];
    mount();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
    mocks.accountId = "b";
    mocks.restReady = false;
    update();
    expect(state.pendingSettlementSymbols).toEqual([]);
    mocks.restReady = true;
    mocks.rest = [];
    update();
    expect(state.pendingSettlementSymbols).toEqual([]);
    mocks.positions = [{ ...holding, position_qty: 3 }];
    update();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
  });
  it("ignores a late history result for the previous account and stops tasks on logout", async () => {
    mount();
    await flush();
    mocks.accountId = "b";
    mocks.history = { accountId: "a", rows: [{ symbol: holding.symbol }] };
    update();
    expect(state.historyRecords).toEqual([]);
    mocks.accountId = undefined;
    mocks.status = AccountStatusEnum.NotConnected;
    mocks.cache.clear();
    update();
    await flush();
    expect(state.accountReady).toBe(false);
    expect(state.pendingSettlementSymbols).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("revalidates A after A → B → A without adding B's stream to A's cached observations", () => {
    const other = { ...holding, symbol: "PERP_ETH5M2601010000_USDC" };
    mocks.positions = [holding];
    mount();
    mocks.accountId = "b";
    mocks.positions = [other];
    mocks.rest = [other];
    update();
    expect(state.pendingSettlementSymbols).toEqual([other.symbol]);
    mocks.accountId = "a";
    mocks.restReady = false;
    update();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
    mocks.restReady = true;
    mocks.rest = [];
    update();
    update();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
    mocks.positions = [holding];
    update();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
  });
  it("validates a warm REST snapshot on account return without using the previous stream", () => {
    const other = { ...holding, symbol: "PERP_ETH5M2601010000_USDC" };
    mocks.positions = [holding];
    mount();
    mocks.accountId = "b";
    mocks.positions = [other];
    update();
    mocks.accountId = "a";
    mocks.rest = [holding];
    update();
    update();
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
  });
  it("completes every pending page and fails closed on loading, errors and unknown coverage", () => {
    mocks.total = 2;
    mocks.orders = [
      {
        symbol: holding.symbol,
        order_id: 1,
        side: "BUY",
        quantity: 1,
        price: 0.5,
      },
    ];
    mount();
    expect(mocks.loadMore).toHaveBeenCalled();
    expect(state.pendingOrdersComplete).toBe(false);
    mocks.orders.push({ ...mocks.orders[0], order_id: 2 });
    update();
    expect(state.pendingOrdersComplete).toBe(true);
    mocks.validating = true;
    update();
    expect(state.pendingOrdersComplete).toBe(false);
    mocks.validating = false;
    mocks.failed = true;
    update();
    expect(state.pendingOrdersComplete).toBe(false);
    mocks.failed = false;
    mocks.total = undefined;
    update();
    expect(state.pendingOrdersComplete).toBe(false);
  });
  it("disables private Binary and metadata queries when inactive", () => {
    act(() => {
      root = create(<Consumer enabled={false} />);
    });
    expect(mocks.query.mock.calls.every(([key]) => key === null)).toBe(true);
    expect(mocks.privateQuery.mock.calls.every(([key]) => key === null)).toBe(
      true,
    );
    expect(
      mocks.orderQuery.mock.calls.every(
        ([, options]) => options.enabled === false,
      ),
    ).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("omits history queries and polling when only pending account data is requested", () => {
    act(() => {
      root = create(<Consumer includeHistory={false} />);
    });
    expect(mocks.privateQuery.mock.calls.map(([key]) => key)).not.toContain(
      "/v1/position_history?product_type=BINARY&limit=1000",
    );
    expect(vi.getTimerCount()).toBe(0);
  });
  it("inactive consumers do not retain another account's observation activation", () => {
    const other = { ...holding, symbol: "PERP_ETH5M2601010000_USDC" };
    mocks.positions = [holding];
    act(() => {
      root = create(
        <>
          <Consumer />
          <Consumer enabled={false} />
        </>,
      );
    });
    act(() => {
      root!.update(
        <>
          <Consumer enabled={false} />
          <Consumer enabled={false} />
        </>,
      );
    });
    mocks.positions = [other];
    mocks.restReady = false;
    act(() => {
      root!.update(
        <>
          <Consumer enabled={false} />
          <Consumer />
        </>,
      );
    });
    expect(state.pendingSettlementSymbols).toEqual([holding.symbol]);
  });
});
