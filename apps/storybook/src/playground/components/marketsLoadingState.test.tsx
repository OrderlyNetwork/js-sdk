import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMarkets } from "@orderly.network/hooks/src/orderly/markets/useMarkets";
import { useFutures } from "@orderly.network/hooks/src/orderly/useFutures";
import { useMarketStore } from "@orderly.network/hooks/src/orderly/useMarket/market.store";

const query = vi.hoisted(() => ({
  data: undefined as any,
  error: undefined as any,
  savePreferences: vi.fn(),
}));
vi.mock("@orderly.network/hooks/src/useQuery", () => ({
  useQuery: () => query,
}));
vi.mock("@orderly.network/hooks/src/orderlyContext", async () => {
  const { createContext } = await import("react");
  return {
    OrderlyContext: createContext({
      configStore: { get: () => undefined, set: query.savePreferences },
    }),
    useOrderlyContext: () => ({}),
  };
});
vi.mock("@orderly.network/hooks/src/useEventEmitter", () => ({
  useEventEmitter: () => ({ on: vi.fn(), off: vi.fn(), emit: vi.fn() }),
}));
vi.mock("@orderly.network/hooks/src/useBadgeBySymbol", () => ({
  getSymbolDisplayName: (symbol: string) => symbol,
}));
vi.mock("@orderly.network/hooks/src/orderly/useSymbolsInfo", () => ({
  useSymbolsInfo: () =>
    new Proxy(
      {},
      {
        get: () => (key: string) =>
          ({ created_time: 1, base_imr: 0.1, quote_dp: 2 })[key],
      },
    ),
}));
vi.mock("@orderly.network/hooks/src/orderly/useRwaSymbolsInfo", () => ({
  useRwaSymbolsInfo: () => ({ isNil: true }),
  useRwaSymbolsInfoStore: () => null,
}));
vi.mock("@orderly.network/hooks/src/useWS", () => ({
  useWS: () => ({ subscribe: () => () => {} }),
}));
vi.mock("swr/subscription", () => ({ default: () => ({ data: undefined }) }));

const ready = { isReady: true, isLoading: false, error: undefined };
const pending = { isReady: false, isLoading: true, error: undefined };
const symbol = {
  symbol: "PERP_ETH_USDC",
  "24h_amount": 2000,
  open_interest: 1,
  index_price: 1,
} as any;
let renderer: ReactTestRenderer;
let result: ReturnType<typeof useMarkets>;
let futures: ReturnType<typeof useFutures>;
let frames: { isReady: boolean; count: number }[];
function MarketsHarness() {
  result = useMarkets();
  frames.push({ isReady: result[1].isReady, count: result[0].length });
  return null;
}
function FuturesHarness() {
  futures = useFutures();
  return null;
}
beforeEach(() => {
  query.savePreferences.mockClear();
  query.data = undefined;
  query.error = undefined;
  frames = [];
  useMarketStore.setState({
    market: [],
    marketMap: null,
    requestStatus: pending,
  });
});
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
});

describe("first market request status", () => {
  it("distinguishes pending, failure, successful empty response and background failure", () => {
    act(() => {
      renderer = create(<FuturesHarness />);
    });
    expect(futures).toMatchObject({ data: [], ...pending });
    query.error = new Error("Failed");
    act(() => renderer.update(<FuturesHarness />));
    expect(futures).toMatchObject({
      isReady: false,
      isLoading: false,
      error: query.error,
    });
    query.data = [];
    query.error = undefined;
    act(() => renderer.update(<FuturesHarness />));
    expect(futures).toMatchObject({ data: [], ...ready });
    query.data = [symbol];
    query.error = new Error("Refresh failed");
    act(() => renderer.update(<FuturesHarness />));
    expect(futures).toMatchObject({
      data: [symbol],
      isReady: true,
      isLoading: false,
    });
  });

  it("does not treat WebSocket data as completion of the first HTTP request", () => {
    act(() => {
      renderer = create(<MarketsHarness />);
    });
    act(() => useMarketStore.getState().actions.updateMarket([symbol]));
    expect(result[1]).toMatchObject(pending);
    expect(result[0]).toHaveLength(1);
  });

  it("publishes readiness and the derived list in the same render", () => {
    act(() => {
      renderer = create(<MarketsHarness />);
    });
    act(() => useMarketStore.getState().actions.updateMarket([symbol], ready));
    expect(result[0][0].symbol).toBe(symbol.symbol);
    expect(result[1]).toMatchObject(ready);
    expect(frames.filter((frame) => frame.isReady)).toEqual([
      { isReady: true, count: 1 },
    ]);
  });

  it("allows a successful empty response and recovers from an initial failure", () => {
    act(() => {
      renderer = create(<MarketsHarness />);
    });
    const error = new Error("Failed");
    act(() =>
      useMarketStore
        .getState()
        .actions.updateMarket([], { isReady: false, isLoading: false, error }),
    );
    expect(result[1]).toMatchObject({
      isReady: false,
      isLoading: false,
      error,
    });
    act(() => useMarketStore.getState().actions.updateMarket([], ready));
    expect(result[1]).toMatchObject(ready);
    expect(result[0]).toEqual([]);
  });

  it("preserves successful data on background failures and keeps status out of preferences", () => {
    act(() => {
      renderer = create(<MarketsHarness />);
    });
    act(() => useMarketStore.getState().actions.updateMarket([symbol], ready));
    act(() =>
      useMarketStore.getState().actions.updateMarket([], {
        ...pending,
        error: new Error("Refresh failed"),
        isLoading: false,
      }),
    );
    expect(result[0]).toHaveLength(1);
    expect(result[1]).toMatchObject({ isReady: true, isLoading: false });
    act(() =>
      useMarketStore
        .getState()
        .actions.updateMarket([{ ...symbol, "24h_amount": 3000 }]),
    );
    expect(result[0][0]["24h_amount"]).toBe(3000);
    expect(result[1].isReady).toBe(true);
    const preferences = query.savePreferences.mock.calls.at(-1)![1];
    expect(preferences).not.toHaveProperty("isReady");
    expect(preferences).not.toHaveProperty("isLoading");
    expect(preferences).not.toHaveProperty("error");
  });
});
