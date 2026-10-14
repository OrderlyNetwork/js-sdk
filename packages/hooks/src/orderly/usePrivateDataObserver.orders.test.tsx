import React, { PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { SWRConfig } from "swr";
import {
  AccountStatusEnum as mockAccountStatusEnum,
  OrderSide,
} from "@orderly.network/types";
import { createOrderKeyRegistry } from "../provider/dataCenter/orderKeyRegistry";
import { useOrderStream } from "./useOrderStream/useOrderStream";
import { usePrivateDataObserver } from "./usePrivateDataObserver";

let mockAccountId = "account";
let mockSubscribed = true;
let mockRows: any[];
let mockAlgoRows: any[];
let mockRegistry: ReturnType<typeof createOrderKeyRegistry>;
let mockListeners: Map<string, (data: any) => void>;
const mockEmit = jest.fn();
const mockAccount = { on: jest.fn(), off: jest.fn() };
const mockGet = jest.fn(async (url: string) => {
  const parsed = new URL(url, "https://example.com");
  const query = parsed.searchParams;
  const rows = (
    parsed.pathname.includes("/algo/") ? mockAlgoRows : mockRows
  ).filter((row) => {
    const side = query.get("side");
    const symbol = query.get("symbol");
    return (
      (!side || side === "all" || row.side === side) &&
      (!symbol || row.symbol === symbol) &&
      (!query.has("start_t") ||
        row.created_time >= Number(query.get("start_t"))) &&
      (!query.has("end_t") || row.created_time <= Number(query.get("end_t")))
    );
  });
  const size = Number(query.get("size") || 50);
  const page = Number(query.get("page") || 1);
  return {
    rows: rows.slice((page - 1) * size, page * size),
    meta: { total: rows.length, current_page: page, records_per_page: size },
  };
});

jest.mock("@orderly.network/net", () => ({
  get: (url: string) => mockGet(url),
}));
jest.mock("@orderly.network/core", () => ({
  EVENT_NAMES: { statusChanged: "statusChanged" },
}));
jest.mock("../middleware/signatureMiddleware", () => ({
  signatureMiddleware: (next: any) => (key: any, fetcher: any, config: any) =>
    next(key, (args: any) => fetcher(args[0], {}), config),
}));
jest.mock("../useAccount", () => ({
  useAccount: () => ({
    state: {
      accountId: mockAccountId,
      status: mockAccountStatusEnum.EnableTrading,
    },
    account: mockAccount,
  }),
}));
jest.mock("../useWS", () => ({
  useWS: () => ({
    privateSubscribe: (topic: unknown, handler: any) => {
      if (typeof topic === "string")
        mockListeners.set(topic, handler.onMessage);
      return () => {
        if (typeof topic === "string") mockListeners.delete(topic);
      };
    },
  }),
}));
jest.mock("../useEventEmitter", () => ({
  useEventEmitter: () => ({ emit: mockEmit }),
}));
jest.mock("../useLocalStorage", () => ({
  useLocalStorage: () => [mockSubscribed],
}));
jest.mock("../usePrivateQuery", () => ({ usePrivateQuery: () => ({}) }));
jest.mock("../useCalculatorService", () => ({
  useCalculatorService: () => ({}),
}));
jest.mock("../next/apiStatus/apiStatus.store", () => ({
  useApiStatusActions: () => ({}),
}));
jest.mock("./appStore", () => ({ useAppStore: () => ({}) }));
jest.mock("./orderlyHooks", () => ({ usePositionActions: () => ({}) }));
jest.mock("../provider/dataCenter/dataCenterContext", () => ({
  useDataCenterContext: () => ({
    registerKeyHandler: mockRegistry.register,
    unregisterKeyHandler: mockRegistry.unregister,
  }),
}));
jest.mock("../useMutation", () => ({ useMutation: () => [jest.fn(), {}] }));
jest.mock("./useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({ data: {} }),
}));
jest.mock("./useSymbolsInfo", () => ({ useSymbolsInfo: () => ({}) }));

describe("order reports through observer, query registration and real SWR pagination", () => {
  const symbol = "PERP_BTC_USDC";
  const buy = {
    order_id: 1,
    side: "BUY",
    symbol,
    status: "NEW",
    created_time: 100,
  };
  const report = (overrides = {}) => ({
    orderId: 2,
    side: "SELL",
    symbol,
    status: "NEW",
    timestamp: 300,
    ...overrides,
  });
  type Params = Parameters<typeof useOrderStream>[0];
  type QueryProps = { first: Params; other?: Params; enabled?: boolean };
  const mount = (
    params: Params = {},
    second?: Params,
    cache = new Map(),
    strict = false,
    keepPreviousData = false,
  ) => {
    // The observer must update this provider, rather than SWR's default global cache.
    const wrapper = ({ children }: PropsWithChildren) => {
      const content = (
        <SWRConfig
          value={{
            provider: () => cache,
            dedupingInterval: 0,
            shouldRetryOnError: false,
            keepPreviousData,
          }}
        >
          {children}
        </SWRConfig>
      );
      return strict ? <React.StrictMode>{content}</React.StrictMode> : content;
    };
    const hooks = renderHook(
      ({ first, other, enabled = true }: QueryProps) => {
        usePrivateDataObserver({ getKeysMap: () => mockRegistry.handlers });
        const firstResult = useOrderStream(
          { productType: "PERP", sourceTypeAll: true, ...first },
          { enabled, stopOnUnmount: true },
        );
        const otherResult = useOrderStream(
          { productType: "PERP", sourceTypeAll: true, ...other },
          { enabled: other !== undefined, stopOnUnmount: true },
        );
        return { first: firstResult, other: otherResult };
      },
      { wrapper, initialProps: { first: params, other: second } as QueryProps },
    );
    return { ...hooks, cache };
  };
  const tick = async (ms = 0) => {
    await act(async () => {
      jest.advanceTimersByTime(ms);
      await Promise.resolve();
      await Promise.resolve();
    });
  };
  const send = async (data: any, topic = "executionreport") => {
    await act(async () => {
      mockListeners.get(topic)!(data);
    });
  };
  beforeEach(() => {
    jest.useFakeTimers();
    mockAccountId = "account";
    mockSubscribed = true;
    mockRows = [{ ...buy }];
    mockAlgoRows = [];
    mockRegistry = createOrderKeyRegistry();
    mockListeners = new Map();
    mockGet.mockClear();
    mockEmit.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  it.each([
    { selected: OrderSide.BUY, incoming: "SELL" },
    { selected: OrderSide.SELL, incoming: "BUY" },
  ])(
    "ignores $incoming in a $selected cache without changing totals or refetching",
    async ({ selected, incoming }) => {
      mockRows = [{ ...buy, side: selected }];
      const view = mount({ side: selected });
      await tick();
      const requests = mockGet.mock.calls.length;
      await send(report({ side: incoming }));
      await tick(1200);
      expect(view.result.current.first[0]).toHaveLength(1);
      expect(view.result.current.first[1].meta?.total).toBe(1);
      expect(mockGet).toHaveBeenCalledTimes(requests);
      expect(mockEmit).toHaveBeenCalledWith(
        "orders:changed",
        expect.objectContaining({ side: incoming }),
      );
      view.unmount();
    },
  );

  it.each([OrderSide.BUY, undefined])(
    "merges matching unbounded first-page reports for side %s",
    async (side) => {
      const view = mount({ side });
      await tick();
      await send(report({ side: "BUY" }));
      expect(view.result.current.first[0]?.map((row) => row.order_id)).toEqual([
        2, 1,
      ]);
      expect(view.result.current.first[1].meta?.total).toBe(2);
      view.unmount();
    },
  );

  it.each([
    { from: new Date(50), to: new Date(150) },
    { to: new Date(150) },
    { from: new Date(50) },
  ])(
    "refreshes date queries using REST rather than the execution timestamp: %j",
    async (dateRange) => {
      const view = mount({ side: OrderSide.BUY, dateRange });
      await tick();
      const requests = mockGet.mock.calls.length;
      // The new order falls outside end_t, even though the execution event lacks createdTime.
      mockRows.push({ ...buy, order_id: 2, created_time: 300 });
      await send(report({ side: "BUY" }));
      expect(view.result.current.first[0]).toHaveLength(1);
      await tick(200);
      expect(mockGet).toHaveBeenCalledTimes(requests + 1);
      expect(view.result.current.first[0]).toHaveLength(dateRange.to ? 1 : 2);
      expect(view.result.current.first[1].meta?.total).toBe(
        dateRange.to ? 1 : 2,
      );
      view.unmount();
    },
  );

  it("does not refetch date caches for an opposite-side report", async () => {
    const view = mount({
      side: OrderSide.BUY,
      dateRange: { to: new Date(150) },
    });
    await tick();
    const requests = mockGet.mock.calls.length;
    await send(report());
    await tick(1200);
    expect(mockGet).toHaveBeenCalledTimes(requests);
    view.unmount();
  });

  it("retains historical orders updated today and accepts exact date boundaries", async () => {
    const params = {
      side: OrderSide.BUY,
      dateRange: { from: new Date(100), to: new Date(150) },
    };
    const view = mount(params);
    await tick();
    mockRows[0] = { ...buy, status: "FILLED", updated_time: 999 };
    mockRows.push({ ...buy, order_id: 2, created_time: 150 });
    await send({ orderId: 1, status: "FILLED", timestamp: 999 });
    await send(report({ side: "BUY", timestamp: 150 }));
    await tick(200);
    expect(view.result.current.first[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          order_id: 1,
          created_time: 100,
          status: "FILLED",
        }),
        expect.objectContaining({ order_id: 2, created_time: 150 }),
      ]),
    );
    view.unmount();
  });

  it("keeps valid data after a refresh failure and recovers on the next report", async () => {
    const view = mount({
      side: OrderSide.BUY,
      dateRange: { to: new Date(150) },
    });
    await tick();
    mockGet.mockRejectedValueOnce(new Error("network"));
    await send(report({ side: "BUY" }));
    await tick(200);
    expect(view.result.current.first[0]).toHaveLength(1);
    expect(view.result.current.first[1].meta?.total).toBe(1);
    expect(view.result.current.first[1].error).toEqual(new Error("network"));
    await send(report({ side: "BUY" }));
    await tick(1000);
    expect(view.result.current.first[1].error).toBeUndefined();
    view.unmount();
  });

  it("refreshes retained multi-page data on remount after missing reports while hidden", async () => {
    mockRows.push({ ...buy, order_id: 3 });
    const params = { side: OrderSide.BUY, size: 1 };
    const first = mount(params);
    await tick();
    await act(async () => {
      await first.result.current.first[1].loadMore();
    });
    first.unmount();
    mockRows.unshift({ ...buy, order_id: 2 });
    const requests = mockGet.mock.calls.length;
    const second = mount(params, undefined, first.cache);
    // SWR defers revalidation to the next animation frame when cached data exists.
    await tick(20);
    expect(mockGet).toHaveBeenCalledTimes(requests + 2);
    expect(second.result.current.first[0]?.map((row) => row.order_id)).toEqual([
      2, 1,
    ]);
    second.unmount();
  });

  it("keeps different date queries independent and shares identical queries", async () => {
    const first = { side: OrderSide.BUY, dateRange: { to: new Date(150) } };
    const other = { side: OrderSide.BUY, dateRange: { to: new Date(300) } };
    const view = mount(first, other);
    await tick();
    expect(mockRegistry.handlers.size).toBe(2);
    mockRows.push({ ...buy, order_id: 2, created_time: 300 });
    const requests = mockGet.mock.calls.length;
    await send(report({ side: "BUY", timestamp: 999 }));
    await tick(200);
    expect(mockGet).toHaveBeenCalledTimes(requests + 2);
    expect(view.result.current.first[0]).toHaveLength(1);
    expect(view.result.current.other[0]).toHaveLength(2);
    view.rerender({ first, other: first });
    await tick();
    expect(mockRegistry.handlers.size).toBe(1);
    view.rerender({ first, other: undefined });
    expect(mockRegistry.handlers.size).toBe(1);
    view.unmount();
    expect(mockRegistry.handlers.size).toBe(0);
  });

  it("preserves a queued report across an equivalent date-range rerender", async () => {
    const first = { side: OrderSide.BUY, dateRange: { to: new Date(150) } };
    const view = mount(first);
    await tick();
    const requests = mockGet.mock.calls.length;
    mockRows.push({ ...buy, order_id: 2, created_time: 120 });
    await send(report({ side: "BUY", timestamp: 120 }));
    view.rerender({
      first: { side: OrderSide.BUY, dateRange: { to: new Date(150) } },
    });
    await tick(1200);
    expect(mockGet).toHaveBeenCalledTimes(requests + 1);
    expect(view.result.current.first[0]).toHaveLength(2);
    view.unmount();
  });

  it("preserves in-flight follow-up reports across equivalent query rerenders", async () => {
    const first = { side: OrderSide.BUY, dateRange: { to: new Date(150) } };
    const view = mount(first);
    await tick();
    const requests = mockGet.mock.calls.length;
    let resolve: (data: Awaited<ReturnType<typeof mockGet>>) => void;
    mockGet.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const second = { ...buy, order_id: 2, created_time: 120 };
    mockRows.push(second);
    await send(report({ side: "BUY", timestamp: 120 }));
    await tick(200);
    mockRows.push({ ...buy, order_id: 3, created_time: 130 });
    await send(report({ orderId: 3, side: "BUY", timestamp: 130 }));
    view.rerender({
      first: { side: OrderSide.BUY, dateRange: { to: new Date(150) } },
    });
    await act(async () => {
      resolve!({
        rows: [buy, second],
        meta: { total: 2, current_page: 1, records_per_page: 50 },
      });
    });
    await tick(1000);
    expect(mockGet).toHaveBeenCalledTimes(requests + 2);
    expect(view.result.current.first[0]).toHaveLength(3);
    view.unmount();
  });

  it("refreshes all cached pages when switching a date query away and back", async () => {
    mockRows.push({ ...buy, order_id: 3 });
    const first = {
      side: OrderSide.BUY,
      size: 1,
      dateRange: { to: new Date(150) },
    };
    const other = {
      side: OrderSide.BUY,
      size: 1,
      dateRange: { from: new Date(200), to: new Date(350) },
    };
    const view = mount(first);
    await tick();
    await act(async () => {
      await view.result.current.first[1].loadMore();
    });
    view.rerender({ first: other });
    await tick(20);
    mockRows.unshift({ ...buy, order_id: 2 });
    await send(report({ side: "BUY", timestamp: 100 }));
    await tick(200);
    const requests = mockGet.mock.calls.length;
    view.rerender({ first });
    await tick(220);
    expect(mockGet).toHaveBeenCalledTimes(requests + 2);
    expect(view.result.current.first[0]?.map((row) => row.order_id)).toEqual([
      2, 1,
    ]);
    expect(view.result.current.first[1].meta?.total).toBe(3);
    view.unmount();
  });

  it("refreshes every cached page when a query is re-enabled without remounting", async () => {
    mockRows.push({ ...buy, order_id: 3 });
    const first = { side: OrderSide.BUY, size: 1 };
    const view = mount(first);
    await tick();
    await act(async () => {
      await view.result.current.first[1].loadMore();
    });
    view.rerender({ first, enabled: false });
    mockRows.unshift({ ...buy, order_id: 2 });
    const requests = mockGet.mock.calls.length;
    view.rerender({ first, enabled: true });
    await tick(220);
    expect(mockGet).toHaveBeenCalledTimes(requests + 2);
    expect(view.result.current.first[0]?.map((row) => row.order_id)).toEqual([
      2, 1,
    ]);
    view.unmount();
  });

  it("refreshes every loaded Algo page when re-enabled", async () => {
    mockRows = [];
    mockAlgoRows = Array.from({ length: 101 }, (_, index) => ({
      algo_order_id: index + 1,
      side: "BUY",
      symbol,
      created_time: 100,
    }));
    const first = { side: OrderSide.BUY, sourceTypeAll: false };
    const view = mount(first);
    await tick();
    await act(async () => {
      await view.result.current.first[1].loadMore();
    });
    expect(view.result.current.first[0]).toHaveLength(101);
    view.rerender({ first, enabled: false });
    mockAlgoRows.unshift({
      algo_order_id: 999,
      side: "BUY",
      symbol,
      created_time: 100,
    });
    view.rerender({ first, enabled: true });
    await tick(220);
    expect(view.result.current.first[0]).toHaveLength(102);
    expect(
      view.result.current.first[0]?.some((row) => row.algo_order_id === 100),
    ).toBe(true);
    view.unmount();
  });

  it("deduplicates full refreshes when two consumers reactivate the same cached query", async () => {
    mockRows.push({ ...buy, order_id: 3 });
    const first = {
      side: OrderSide.BUY,
      size: 1,
      dateRange: { to: new Date(150) },
    };
    const alternate = {
      side: OrderSide.BUY,
      size: 1,
      dateRange: { from: new Date(200), to: new Date(350) },
    };
    const view = mount(first, first);
    await tick();
    await act(async () => {
      await view.result.current.first[1].loadMore();
    });
    view.rerender({ first: alternate, other: alternate });
    await tick(20);
    mockRows.unshift({ ...buy, order_id: 2 });
    const requests = mockGet.mock.calls.length;
    view.rerender({ first, other: first });
    await tick(220);
    expect(view.result.current.first[0]?.map((row) => row.order_id)).toEqual([
      2, 1,
    ]);
    expect(view.result.current.other[0]?.map((row) => row.order_id)).toEqual([
      2, 1,
    ]);
    expect(mockGet).toHaveBeenCalledTimes(requests + 2);
    view.unmount();
  });

  it("does not treat keepPreviousData as a cache hit for an uncached query", async () => {
    const first = { side: OrderSide.BUY };
    const view = mount(first, undefined, new Map(), false, true);
    await tick();
    const requests = mockGet.mock.calls.length;
    view.rerender({ first: { side: OrderSide.SELL } });
    await tick(220);
    expect(mockGet).toHaveBeenCalledTimes(requests + 1);
    expect(view.result.current.first[0]).toHaveLength(0);
    view.unmount();
  });

  it("coordinates the first enable of a hidden consumer with an existing cached query", async () => {
    mockRows.push({ ...buy, order_id: 3 });
    const first = { side: OrderSide.BUY, size: 1 };
    const view = mount(first);
    await tick();
    await act(async () => {
      await view.result.current.first[1].loadMore();
    });
    mockRows.unshift({ ...buy, order_id: 2 });
    const requests = mockGet.mock.calls.length;
    view.rerender({ first, other: first });
    await tick(220);
    expect(mockGet).toHaveBeenCalledTimes(requests + 2);
    expect(view.result.current.other[0]?.map((row) => row.order_id)).toEqual([
      2, 1,
    ]);
    view.unmount();
  });

  it("refreshes all loaded pages instead of shifting their boundaries locally", async () => {
    mockRows.push({ ...buy, order_id: 3 });
    const view = mount({ side: OrderSide.BUY, size: 1 });
    await tick();
    await act(async () => {
      await view.result.current.first[1].loadMore();
    });
    expect(view.result.current.first[0]).toHaveLength(2);
    const requests = mockGet.mock.calls.length;
    mockRows.unshift({ ...buy, order_id: 2 });
    await send(report({ side: "BUY" }));
    await tick(200);
    expect(mockGet).toHaveBeenCalledTimes(requests + 2);
    expect(view.result.current.first[0]?.map((row) => row.order_id)).toEqual([
      2, 1,
    ]);
    expect(view.result.current.first[1].meta?.total).toBe(3);
    view.unmount();
  });

  it("refreshes a manual second page and keeps page-specific registrations separate", async () => {
    mockRows.push({ ...buy, order_id: 3 });
    const view = mount(
      { side: OrderSide.BUY, size: 1, page: 2 },
      { side: OrderSide.BUY, size: 1, page: 1 },
    );
    await tick();
    expect(mockRegistry.handlers.size).toBe(2);
    mockRows.unshift({ ...buy, order_id: 2 });
    await send(report({ side: "BUY" }));
    await tick(200);
    expect(view.result.current.first[0]?.map((row) => row.order_id)).toEqual([
      1,
    ]);
    expect(view.result.current.first[1].meta?.total).toBe(3);
    view.unmount();
  });

  it("ignores wrong symbols and Binary reports in a Perps query", async () => {
    const view = mount({ side: OrderSide.BUY, symbol });
    await tick();
    const requests = mockGet.mock.calls.length;
    await send(report({ side: "BUY", symbol: "PERP_ETH_USDC" }));
    await send(report({ side: "BUY", symbol: "PERP_BTC5M2610130125_USDC" }));
    await tick(1200);
    expect(view.result.current.first[0]).toHaveLength(1);
    expect(mockGet).toHaveBeenCalledTimes(requests);
    view.unmount();
  });

  it("uses cached immutable fields for sparse updates and refetches unknown inserts", async () => {
    const view = mount({ side: OrderSide.BUY });
    await tick();
    const requests = mockGet.mock.calls.length;
    await send({ orderId: 1, status: "REPLACED", timestamp: 999, price: 10 });
    expect(view.result.current.first[0]?.[0].price).toBe(10);
    expect(view.result.current.first[0]?.[0].created_time).toBe(100);
    await send({ orderId: 2, status: "NEW", timestamp: 999 });
    await tick(200);
    expect(mockGet).toHaveBeenCalledTimes(requests + 1);
    expect(view.result.current.first[0]).toHaveLength(1);
    view.unmount();
  });

  it("applies direction and date rules to Algo reports too", async () => {
    const root = {
      algoOrderId: 10,
      rootAlgoOrderId: 10,
      parentAlgoOrderId: 0,
      algoType: "STOP",
      type: "LIMIT_ORDER",
      rootAlgoStatus: "NEW",
      algoStatus: "NEW",
      symbol,
      side: "SELL",
      timestamp: 300,
    };
    const view = mount({
      side: OrderSide.BUY,
      sourceTypeAll: false,
      dateRange: { to: new Date(150) },
    });
    await tick();
    const requests = mockGet.mock.calls.length;
    await send([root], "algoexecutionreport");
    await tick(1200);
    expect(mockGet).toHaveBeenCalledTimes(requests);
    await send([{ ...root, side: "BUY" }], "algoexecutionreport");
    await tick(200);
    expect(mockGet).toHaveBeenCalledTimes(requests + 1);
    expect(view.result.current.first[0]).toHaveLength(1);
    view.unmount();
  });

  it("cancels pending refreshes on account switch and query unmount", async () => {
    const params = { side: OrderSide.BUY, dateRange: { to: new Date(150) } };
    const view = mount(params);
    await tick();
    await send(report({ side: "BUY" }));
    mockAccountId = "other-account";
    view.rerender({ first: params, other: undefined });
    await tick();
    const requests = mockGet.mock.calls.length;
    await tick(200);
    expect(mockGet).toHaveBeenCalledTimes(requests);
    await send(report({ side: "BUY" }));
    view.unmount();
    await tick(200);
    expect(mockGet).toHaveBeenCalledTimes(requests);
  });

  it("continues updating after Strict Mode replays subscription effects", async () => {
    const view = mount(
      { side: OrderSide.BUY, dateRange: { to: new Date(150) } },
      undefined,
      new Map(),
      true,
    );
    await tick();
    const requests = mockGet.mock.calls.length;
    await send(report({ side: "BUY" }));
    await tick(200);
    expect(mockGet).toHaveBeenCalledTimes(requests + 1);
    view.unmount();
  });

  it("preserves Algo field-change notifications when date queries refetch", async () => {
    mockAlgoRows = [
      {
        algo_order_id: 10,
        side: "BUY",
        symbol,
        algo_type: "TRAILING_STOP",
        algo_status: "NEW",
        root_algo_status: "NEW",
        created_time: 100,
        extreme_price: 100,
        is_activated: false,
      },
    ];
    const view = mount({
      side: OrderSide.BUY,
      sourceTypeAll: false,
      dateRange: { to: new Date(150) },
    });
    await tick();
    await send(
      [
        {
          algoOrderId: 10,
          rootAlgoOrderId: 10,
          parentAlgoOrderId: 0,
          algoType: "TRAILING_STOP",
          algoStatus: "REPLACED",
          rootAlgoStatus: "REPLACED",
          side: "BUY",
          symbol,
          extremePrice: 110,
          isActivated: true,
          timestamp: 999,
        },
      ],
      "algoexecutionreport",
    );
    expect(mockEmit).toHaveBeenCalledWith(
      "orders:changed",
      expect.objectContaining({
        status: "REPLACED",
        fieldChanges: {
          TRAILING_STOP: { extreme_price: true, is_activated: true },
        },
      }),
    );
    view.unmount();
  });

  it.each(["PERP", "BINARY"])(
    "isolates %s reports by product without a symbol filter",
    async (productType) => {
      const binarySymbol = "PERP_BTC5M2610130125_USDC";
      mockRows = [
        { ...buy, symbol: productType === "BINARY" ? binarySymbol : symbol },
      ];
      const view = mount({ productType, side: OrderSide.BUY });
      await tick();
      const requests = mockGet.mock.calls.length;
      await send(
        report({
          side: "BUY",
          symbol: productType === "BINARY" ? symbol : binarySymbol,
        }),
      );
      await tick(1200);
      expect(view.result.current.first[0]).toHaveLength(1);
      expect(mockGet).toHaveBeenCalledTimes(requests);
      view.unmount();
    },
  );
});
