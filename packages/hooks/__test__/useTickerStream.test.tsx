import { act, renderHook } from "@testing-library/react";
import { useTickerStream } from "../src/orderly/useTickerStream";

const mocks: {
  onMessage?: (message: any) => void;
  info: any;
} = {
  info: undefined,
};

jest.mock("../src/useQuery", () => ({
  useQuery: () => ({ data: mocks.info }),
}));

jest.mock("../src/useWS", () => ({
  useWS: () => ({
    subscribe: (_topic: string, callbacks: { onMessage: any }) => {
      mocks.onMessage = callbacks.onMessage;
      return () => {};
    },
  }),
}));

jest.mock("../src/orderly/useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({ data: { PERP_ETH_USDC: 2010 } }),
}));

jest.mock("../src/orderly/useIndexPrice", () => ({
  useIndexPrice: () => ({ data: 2009 }),
}));

jest.mock("../src/orderly/useOpenInterest", () => ({
  useOpenInterest: () => ({ data: 100 }),
}));

jest.mock("../src/orderly/useMarkPrice", () => ({
  useMarkPrice: () => ({ data: undefined }),
}));

jest.mock("../src/orderly/useMarket/market.store", () => ({
  useMarketMap: () => ({}),
}));

describe("useTickerStream", () => {
  beforeEach(() => {
    mocks.onMessage = undefined;
    mocks.info = {
      symbol: "PERP_ETH_USDC",
      "24h_open": 2000,
      "24h_close": 2100,
    };
  });

  it("calculates the change from REST data before a ticker arrives", () => {
    const { result } = renderHook(() => useTickerStream("PERP_ETH_USDC"));

    expect(result.current["24h_change"]).toBe(100);
    expect(result.current.change).toBe(0.05);
  });

  it("uses live ticker values once available", () => {
    const { result } = renderHook(() => useTickerStream("PERP_ETH_USDC"));

    act(() => {
      mocks.onMessage?.({ symbol: "PERP_ETH_USDC", open: 2000, close: 1900 });
    });

    expect(result.current["24h_close"]).toBe(1900);
    expect(result.current["24h_change"]).toBe(-100);
    expect(result.current.change).toBe(-0.05);
  });

  it("does not divide by a zero open price", () => {
    mocks.info = { ...mocks.info, "24h_open": 0 };
    const { result } = renderHook(() => useTickerStream("PERP_ETH_USDC"));

    expect(result.current["24h_change"]).toBe(2100);
    expect(result.current.change).toBeUndefined();
  });
});
