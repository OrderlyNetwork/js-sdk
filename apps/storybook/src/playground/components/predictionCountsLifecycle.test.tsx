import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createOrderKeyRegistry } from "@orderly.network/hooks/src/provider/dataCenter/orderKeyRegistry";
import {
  useSharedProductCounts,
  type UseSharedProductCountsOptions,
} from "@orderly.network/prediction/src/prediction/dataPanels/useSharedProductCounts";

const mocks = vi.hoisted(() => ({
  context: {} as Record<string, unknown>,
  query: vi.fn(),
  positions: [
    { symbol: "PERP_BTC_USDC", position_qty: 1 },
    { symbol: "PERP_ETH_USDC", position_qty: 2 },
    { symbol: "PERP_BTC5M2610101200_USDC", position_qty: 3 },
    { symbol: "PERP_ETH5M2610101200_USDC", position_qty: 0 },
  ],
}));
vi.mock("@orderly.network/hooks", async () => ({
  useOrderStream: (
    await vi.importActual<
      typeof import("@orderly.network/hooks/src/orderly/useOrderStream/useOrderStream")
    >("@orderly.network/hooks/src/orderly/useOrderStream/useOrderStream")
  ).useOrderStream,
  usePositions: () => mocks.positions,
  usePositionStream: () => {
    throw new Error("Counts must not initialize the TP/SL position stream");
  },
}));
vi.mock(
  "@orderly.network/hooks/src/provider/dataCenter/dataCenterContext",
  () => ({
    useDataCenterContext: () => mocks.context,
  }),
);
vi.mock("@orderly.network/hooks/src/useMutation", () => ({
  useMutation: () => [vi.fn(), {}],
}));
vi.mock("@orderly.network/hooks/src/orderly/useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({ data: {} }),
}));
vi.mock("@orderly.network/hooks/src/orderly/useSymbolsInfo", () => ({
  useSymbolsInfo: () => ({}),
}));
vi.mock("@orderly.network/hooks/src/usePrivateInfiniteQuery", () => ({
  usePrivateInfiniteQuery: (
    key: ((page: number, previous: unknown) => string | null) | null,
  ) => {
    const url = key?.(0, null) ?? null;
    mocks.query(url);
    return {
      data: url ? [{ rows: [], meta: { total: 0 } }] : undefined,
      mutate: vi.fn(),
      setSize: vi.fn(),
      isLoading: false,
      isValidating: false,
    };
  },
}));

let registry: ReturnType<typeof createOrderKeyRegistry>;
let root: ReactTestRenderer | undefined;
let result: ReturnType<typeof useSharedProductCounts>;
function Consumer(props: UseSharedProductCountsOptions) {
  result = useSharedProductCounts(props);
  return null;
}
beforeEach(() => {
  vi.clearAllMocks();
  registry = createOrderKeyRegistry();
  mocks.context = {
    registerKeyHandler: registry.register,
    unregisterKeyHandler: registry.unregister,
  };
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
it("starts no private query or cache registration when initially disabled", () => {
  act(() => {
    root = create(<Consumer enabled={false} />);
  });
  expect(mocks.query.mock.calls.every(([key]) => key === null)).toBe(true);
  expect(registry.handlers.size).toBe(0);
  expect(result).toEqual({ positions: 0, pending: 0 });
});
it("releases old symbol keys, pauses on disable, and releases every key on unmount", () => {
  act(() => {
    root = create(<Consumer product="perps" perpsSymbol="PERP_BTC_USDC" />);
  });
  expect(registry.handlers.size).toBe(2);
  expect(result.positions).toBe(1);
  act(() => {
    root!.update(<Consumer product="perps" perpsSymbol="PERP_ETH_USDC" />);
  });
  expect(registry.handlers.size).toBe(2);
  expect(
    [...registry.handlers.keys()].every((key) => key.includes("PERP_ETH_USDC")),
  ).toBe(true);
  mocks.query.mockClear();
  act(() => {
    root!.update(<Consumer product="perps" enabled={false} />);
  });
  expect(registry.handlers.size).toBe(0);
  expect(mocks.query.mock.calls.every(([key]) => key === null)).toBe(true);
  act(() => {
    root!.update(<Consumer />);
  });
  expect(registry.handlers.size).toBe(3);
  expect(result.positions).toBe(3);
  act(() => {
    root!.unmount();
  });
  root = undefined;
  expect(registry.handlers.size).toBe(0);
});
it("preserves a shared consumer's keys until its own unmount", () => {
  act(() => {
    root = create(
      <>
        <Consumer key="a" />
        <Consumer key="b" />
      </>,
    );
  });
  expect(registry.handlers.size).toBe(3);
  act(() => {
    root!.update(
      <>
        <Consumer key="a" enabled={false} />
        <Consumer key="b" />
      </>,
    );
  });
  expect(registry.handlers.size).toBe(3);
  act(() => {
    root!.unmount();
  });
  root = undefined;
  expect(registry.handlers.size).toBe(0);
});
