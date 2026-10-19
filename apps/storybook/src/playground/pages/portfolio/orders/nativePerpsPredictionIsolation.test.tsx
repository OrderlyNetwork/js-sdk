import React, { useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useBinaryInfoObserver } from "@orderly.network/hooks/src/orderly/binaryInfo";
import { useOrderStream } from "@orderly.network/hooks/src/orderly/useOrderStream/useOrderStream";
import { useProductOrderCancelAll } from "@orderly.network/prediction/src/prediction/dataPanels/useProductOrderCancelAll";
import { AccountStatusEnum, OrderStatus } from "@orderly.network/types";
import { useOrderListScript } from "@orderly.network/ui-orders/src/components/orderList/orderList.script";

const mocks = vi.hoisted(() => ({
  ordinaryPages: [{ rows: [], meta: { total: 0 } }] as any[],
  algoPages: [{ rows: [], meta: { total: 0 } }] as any[],
  setOrdinarySize: vi.fn(),
  setAlgoSize: vi.fn(),
  publicQuery: vi.fn(),
  privateQuery: vi.fn(),
  mutation: vi.fn(),
  dialog: undefined as any,
  subscribe: vi.fn(),
  setPage: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@orderly.network/hooks/src/useQuery", () => ({
  useQuery: (...args: unknown[]) => {
    mocks.publicQuery(...args);
    return {};
  },
}));
vi.mock("@orderly.network/hooks/src/orderly/appStore", () => ({
  useAppStore: (selector: any) =>
    selector({ actions: { setBinarySymbolsInfo: vi.fn() } }),
}));
vi.mock("@orderly.network/hooks/src/useMutation", () => ({
  useMutation: (url: string) => [
    (...args: unknown[]) => mocks.mutation(url, ...args),
    {},
  ],
}));
vi.mock("@orderly.network/hooks/src/usePrivateInfiniteQuery", () => ({
  usePrivateInfiniteQuery: (loader: any) => {
    if (loader) mocks.privateQuery(loader(0));
    return {
      data: loader
        ? loader(0).startsWith("/v1/algo/")
          ? mocks.algoPages
          : mocks.ordinaryPages
        : undefined,
      mutate: mocks.refresh,
      setSize: loader?.(0).startsWith("/v1/algo/")
        ? mocks.setAlgoSize
        : mocks.setOrdinarySize,
      isLoading: false,
      isValidating: false,
    };
  },
}));
vi.mock("@orderly.network/hooks/src/orderly/useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({ data: {} }),
}));
vi.mock("@orderly.network/hooks/src/orderly/useSymbolsInfo", () => ({
  useSymbolsInfo: () => ({}),
}));
vi.mock(
  "@orderly.network/hooks/src/provider/dataCenter/dataCenterContext",
  () => ({
    useDataCenterContext: () => ({
      registerKeyHandler: vi.fn(),
      unregisterKeyHandler: vi.fn(),
    }),
  }),
);
vi.mock("@orderly.network/hooks", async () => ({
  useAccount: () => ({
    state: { accountId: "a", status: AccountStatusEnum.EnableTrading },
  }),
  useLocalStorage: (_key: string, initial: any) => useState(initial),
  useOrderStream,
  useRefreshOrderCaches: () => mocks.refresh,
  useSymbolsInfo: () => ({}),
  useMemoizedFn: (
    await vi.importActual<any>(
      "@orderly.network/hooks/src/shared/useMemoizedFn",
    )
  ).useMemoizedFn,
  useMutation: (url: string) => [
    (...args: unknown[]) => mocks.mutation(url, ...args),
  ],
  usePrivateInfiniteQuery: () => ({
    mutate: mocks.refresh,
    setSize: vi.fn(),
    isLoading: false,
    isValidating: false,
  }),
  useWS: () => ({ subscribe: mocks.subscribe }),
}));
vi.mock("@orderly.network/react-app", () => ({
  useCanTrade: () => true,
  useDataTap: (data: unknown) => data,
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  usePagination: () => ({
    page: 1,
    pageSize: 50,
    setPage: mocks.setPage,
    pagination: {},
    parsePagination: () => ({}),
  }),
  Text: ({ children }: any) => children,
  toast: { success: vi.fn(), error: vi.fn() },
  modal: {
    confirm: (options: unknown) => {
      mocks.dialog = options;
      return Promise.resolve(true);
    },
  },
}));
vi.mock("@orderly.network/ui-orders", async () =>
  vi.importActual(
    "@orderly.network/ui-orders/src/components/orderList/useCancelAllConfirmation",
  ),
);
vi.mock("@orderly.network/ui-orders/src/components/orders.widget", () => ({
  TabType: { pending: "pending", tp_sl: "tp_sl", all: "all" },
}));
let root: ReactTestRenderer | undefined, state: any;
function Native({ hasBinaryExposure = true }: { hasBinaryExposure?: boolean }) {
  useBinaryInfoObserver(hasBinaryExposure);
  const cancellation = useProductOrderCancelAll({
    instrument: "perps",
    perpsSymbol: "PERP_BTC_USDC",
  });
  state = useOrderListScript({
    type: "pending" as any,
    ordersStatus: OrderStatus.INCOMPLETE,
    symbol: "PERP_BTC_USDC",
    productType: "PERP",
    cancelAllDisabled: cancellation.disabled,
  });
  state = { ...state, ...cancellation.orderListProps };
  return null;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.ordinaryPages = [{ rows: [], meta: { total: 0 } }];
  mocks.algoPages = [{ rows: [], meta: { total: 0 } }];
  mocks.mutation.mockResolvedValue({ success: true });
  mocks.refresh.mockResolvedValue(undefined);
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
it.each([true, false])(
  "native PERPs keep cancellation and issue no extra Binary queries (observer=%s)",
  async (hasBinaryExposure) => {
    act(() => {
      root = create(<Native hasBinaryExposure={hasBinaryExposure} />);
    });
    expect(mocks.publicQuery).toHaveBeenCalledTimes(1);
    expect(mocks.publicQuery).toHaveBeenCalledWith(
      hasBinaryExposure ? "/v1/public/binary/info" : null,
      expect.objectContaining({
        refreshInterval: hasBinaryExposure ? 60_000 : 0,
      }),
    );
    expect(
      mocks.privateQuery.mock.calls.every(
        ([url]) => !url.includes("BINARY") && !url.includes("position_history"),
      ),
    ).toBe(true);
    expect(mocks.subscribe).not.toHaveBeenCalled();
    expect(state.cancelAllDisabled).not.toBe(true);
    await act(async () => {
      await state.onCancelAll();
      await mocks.dialog.onOk();
    });
    expect(mocks.mutation.mock.calls).toEqual([
      ["/v1/orders", null, { symbol: "PERP_BTC_USDC" }],
      ["/v1/algo/orders", null, { algo_type: "STOP", symbol: "PERP_BTC_USDC" }],
      [
        "/v1/algo/orders",
        null,
        { algo_type: "TRAILING_STOP", symbol: "PERP_BTC_USDC" },
      ],
    ]);
  },
);

it("continues algo-only pages after ordinary orders are exhausted and stops after both streams end", () => {
  mocks.ordinaryPages = [{ rows: [], meta: { total: 99 } }];
  mocks.algoPages = [
    {
      rows: [{ algo_order_id: 1, symbol: "PERP_BTC_USDC" }],
      meta: { total: 101 },
    },
  ];
  let stream: any;
  function Harness() {
    [, stream] = useOrderStream({ productType: "PERP" });
    return null;
  }
  act(() => {
    root = create(<Harness />);
  });
  expect(stream.hasMore).toBe(true);
  act(() => stream.loadMore());
  expect(mocks.setAlgoSize).toHaveBeenCalledOnce();
  mocks.algoPages = [...mocks.algoPages, { rows: [] }];
  act(() => root!.update(<Harness />));
  expect(stream.hasMore).toBe(false);
});
