import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSellPositionScript } from "@orderly.network/prediction/src/prediction/orderEntry/sellPosition/sellPosition.script";
import { AccountStatusEnum } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  cache: new Map(),
  accountId: "a",
  positionQty: 20,
  symbol: "PERP_ETH5M2610091200_USDC",
  row: {} as any,
  restricted: false,
  fee: 6 as number | undefined,
  snapshotCallbacks: new Map<string, (message: any) => void>(),
  updateCallbacks: new Map<string, (message: any) => void>(),
  failure: undefined as undefined | (() => void),
  subscriptions: vi.fn(),
  release: vi.fn(),
  submit: vi.fn(),
  refresh: vi.fn(),
  notify: vi.fn(),
}));
const ws = {
  subscribe: (input: any, options: any) => {
    mocks.failure = options.onError;
    mocks.subscriptions(input);
    mocks.updateCallbacks.set(input.topic, options.onMessage);
    return mocks.release;
  },
  onceSubscribe: (input: any, options: any) => {
    mocks.snapshotCallbacks.set(input.params.symbol, options.onMessage);
  },
};
vi.mock("@orderly.network/i18n", () => ({ i18n: { t: (key: string) => key } }));
vi.mock("@orderly.network/ui", () => ({
  toast: { error: mocks.notify, success: vi.fn() },
}));
vi.mock("@orderly.network/hooks", async () => {
  const { useState } = await import("react");
  return {
    useSWRConfig: () => ({ cache: mocks.cache }),
    useWS: () => ws,
    useMemoizedFn: (
      await vi.importActual<any>(
        "@orderly.network/hooks/src/shared/useMemoizedFn",
      )
    ).useMemoizedFn,
    useAccount: () => ({
      state: {
        accountId: mocks.accountId,
        status: AccountStatusEnum.EnableTrading,
      },
    }),
    useAccountInfo: () => ({
      data: { binary_taker_fee_rate: mocks.fee, binary_maker_fee_rate: 0 },
    }),
    useCollateral: () => ({ freeCollateral: 1000 }),
    useMarkPricesStream: () => ({ data: {} }),
    useLocalStorage: (_key: string, value: unknown) => useState(value),
    useRefreshOrderCaches: () => mocks.refresh,
    useMutation: () => [mocks.submit],
    useOrderStream: () => [
      [],
      {
        meta: { total: 0 },
        loadMore: vi.fn(),
        refresh: mocks.refresh,
        isLoading: false,
        isValidating: false,
      },
    ],
    usePositionStream: () => [
      {
        rows: [
          {
            symbol: mocks.symbol,
            position_qty: mocks.positionQty,
            average_open_price: 0.5,
          },
        ],
      },
    ],
    usePrivateQuery: (key: string | null) => ({
      data:
        key === "/v1/positions"
          ? {
              rows: [{ symbol: mocks.symbol, position_qty: mocks.positionQty }],
            }
          : undefined,
      mutate: mocks.refresh,
      isLoading: false,
    }),
    useQuery: (key: string | null) => ({
      data: key === "/v1/public/binary/info" ? [mocks.row] : undefined,
    }),
  };
});
let root: ReactTestRenderer | undefined;
let sell: ReturnType<typeof useSellPositionScript>;
const views: Record<number, ReturnType<typeof useSellPositionScript>> = {};
function Probe({
  outcome = "up",
  slot = 0,
}: {
  outcome?: "up" | "down";
  slot?: number;
}) {
  sell = useSellPositionScript({
    symbol: mocks.symbol,
    outcome,
    state: {
      accountId: mocks.accountId,
      accountReady: true,
      isRegionRestricted: mocks.restricted,
      hasFeeConfig: mocks.fee != null,
      isSubmitting: false,
      availableQuantity: () => Math.abs(mocks.positionQty),
      isOrderTradable: (symbol: string) =>
        symbol === mocks.symbol && mocks.row.expire_at > Date.now(),
      // A page viewing BTC has no bearing on this ETH holding's exit.
      selectedRow: { symbol: "PERP_BTC5M2610091200_USDC" },
    } as any,
  });
  views[slot] = sell;
  return null;
}
function mount(outcome: "up" | "down" = "up") {
  act(() => {
    root = create(<Probe outcome={outcome} />);
  });
}
function book(
  asks: number[][] = [[0.6, 100]],
  bids: number[][] = [[0.4, 100]],
) {
  act(() => {
    mocks.snapshotCallbacks.get(mocks.symbol)!({
      data: { symbol: mocks.symbol, ts: 1, asks, bids },
    });
  });
}
async function confirm() {
  await act(async () => {
    await sell.confirm();
  });
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-09T04:00:00Z"));
  vi.stubGlobal("window", { setTimeout, clearTimeout });
  vi.clearAllMocks();
  mocks.cache.clear();
  mocks.snapshotCallbacks.clear();
  mocks.updateCallbacks.clear();
  mocks.accountId = "a";
  mocks.row = {
    symbol: mocks.symbol,
    status: "ACTIVE",
    observation_start_at: Date.now() - 1000,
    expire_at: Date.now() + 60000,
    base_tick: 1,
    base_min: 1,
    base_max: 10000,
    quote_tick: 0.01,
    quote_min: 0.01,
    quote_max: 0.99,
    min_notional: 1,
  };
  mocks.positionQty = 20;
  mocks.restricted = false;
  mocks.fee = 6;
  mocks.submit.mockResolvedValue({ success: true, data: { order_id: 1 } });
  mocks.refresh.mockResolvedValue(undefined);
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("symbol-specific sell dialog", () => {
  it("does not subscribe while closed; unlocks a non-selected holding and releases on close", async () => {
    mount();
    expect(sell.tradable).toBe(true);
    expect(mocks.subscriptions).not.toHaveBeenCalled();
    act(() => sell.onOpenChange(true));
    expect(mocks.subscriptions).toHaveBeenCalledExactlyOnceWith({
      event: "subscribe",
      topic: `${mocks.symbol}@orderbookupdate`,
    });
    expect(sell.valid).toBe(false);
    book();
    expect(sell.valid).toBe(true);
    await confirm();
    expect(mocks.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: mocks.symbol,
        side: "SELL",
        order_type: "IOC",
        reduce_only: true,
      }),
    );
    expect(sell.open).toBe(false);
    expect(mocks.release).toHaveBeenCalledTimes(1);
  });
  it("shares a target book between simultaneously opened dialogs", () => {
    act(() => {
      root = create(
        <>
          <Probe slot={0} />
          <Probe slot={1} />
        </>,
      );
    });
    act(() => views[0].onOpenChange(true));
    act(() => views[1].onOpenChange(true));
    book();
    expect(mocks.subscriptions).toHaveBeenCalledTimes(1);
    act(() => views[0].onOpenChange(false));
    expect(mocks.release).not.toHaveBeenCalled();
    act(() => views[1].onOpenChange(false));
    expect(mocks.release).toHaveBeenCalledTimes(1);
  });
  it("disables market confirmation on a public WS error but still accepts a valid limit", () => {
    mount();
    act(() => sell.onOpenChange(true));
    book();
    expect(sell.valid).toBe(true);
    act(() => mocks.failure?.());
    expect(sell.valid).toBe(false);
    act(() => {
      sell.setType("limit");
      sell.setPrice("0.5");
    });
    expect(sell.valid).toBe(true);
  });
  it("maps DOWN exits onto UP asks and BUY IOC", async () => {
    mocks.positionQty = -20;
    mount("down");
    act(() => sell.onOpenChange(true));
    book();
    expect(sell.valid).toBe(true);
    await confirm();
    expect(mocks.submit).toHaveBeenCalledWith(
      expect.objectContaining({ side: "BUY", order_price: "0.62" }),
    );
  });
  it("blocks empty/unready market books but allows a validated limit price", async () => {
    mount();
    act(() => sell.onOpenChange(true));
    expect(sell.valid).toBe(false);
    book([], []);
    expect(sell.valid).toBe(false);
    await confirm();
    expect(mocks.submit).not.toHaveBeenCalled();
    act(() => {
      sell.setType("limit");
      sell.setPrice("0.51");
    });
    expect(sell.valid).toBe(true);
    await confirm();
    expect(mocks.submit).toHaveBeenCalledWith(
      expect.objectContaining({ order_type: "LIMIT", order_price: "0.51" }),
    );
  });
  it.each(["up", "down"] as const)(
    "uses the executable side of a single-sided book for %s",
    (outcome) => {
      mocks.positionQty = outcome === "up" ? 20 : -20;
      mount(outcome);
      act(() => sell.onOpenChange(true));
      book([], [[0.4, 100]]);
      expect(sell.valid).toBe(outcome === "up");
      book([[0.6, 100]], []);
      expect(sell.valid).toBe(outcome === "down");
    },
  );
  it("retains partial-depth IOC rules and rejects depth exceeding slippage", () => {
    mount();
    act(() => sell.onOpenChange(true));
    book([], [[0.4, 1]]);
    expect(sell.valid).toBe(true);
    book(
      [],
      [
        [0.4, 1],
        [0.3, 30],
      ],
    );
    expect(sell.valid).toBe(false);
  });
  it("disables on a sequence gap until a fresh snapshot arrives", () => {
    mount();
    act(() => sell.onOpenChange(true));
    book();
    expect(sell.valid).toBe(true);
    act(() =>
      mocks.updateCallbacks.get(`${mocks.symbol}@orderbookupdate`)!({
        data: { prevTs: 2 },
        ts: 3,
      }),
    );
    expect(sell.valid).toBe(false);
    book();
    expect(sell.valid).toBe(true);
  });
  it.each(["region", "fee", "expiry", "quantity"])(
    "rechecks %s before confirm",
    async (condition) => {
      mount();
      act(() => sell.onOpenChange(true));
      book();
      const capturedConfirm = sell.confirm;
      if (condition === "region") mocks.restricted = true;
      if (condition === "fee") mocks.fee = undefined;
      if (condition === "expiry")
        mocks.row = { ...mocks.row, expire_at: Date.now() - 1 };
      if (condition === "quantity") mocks.positionQty = 1;
      act(() => root!.update(<Probe />));
      expect(sell.valid).toBe(false);
      await confirm();
      await act(async () => {
        await capturedConfirm();
      });
      expect(mocks.submit).not.toHaveBeenCalled();
    },
  );
  it("closes and releases after switching accounts", () => {
    mount();
    act(() => sell.onOpenChange(true));
    book();
    mocks.accountId = "b";
    act(() => root!.update(<Probe />));
    expect(sell.open).toBe(false);
    expect(mocks.release).toHaveBeenCalledTimes(1);
  });
  it("stops subsequent batches and old-account cache refresh when switching in flight", async () => {
    mocks.row.base_max = 1;
    mocks.row.min_notional = 0.01;
    mocks.positionQty = 21;
    let finish!: (response: unknown) => void;
    mocks.submit.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    mount();
    act(() => sell.onOpenChange(true));
    book();
    let pending!: Promise<void>;
    act(() => {
      pending = sell.confirm();
    });
    expect(mocks.submit).toHaveBeenCalledTimes(1);
    mocks.accountId = "b";
    act(() => root!.update(<Probe />));
    await act(async () => {
      finish({
        success: true,
        data: {
          rows: Array.from({ length: 20 }, (_, order_id) => ({
            order_id: order_id + 1,
          })),
        },
      });
      await pending;
    });
    expect(mocks.submit).toHaveBeenCalledTimes(1);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
