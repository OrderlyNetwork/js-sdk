import React, { useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useBinaryInfoObserver } from "@orderly.network/hooks/src/orderly/binaryInfo";
import { useOrderStream } from "@orderly.network/hooks/src/orderly/useOrderStream/useOrderStream";
import { useProductOrderCancelAll } from "@orderly.network/prediction/src/prediction/dataPanels/useProductOrderCancelAll";
import { AccountStatusEnum, OrderStatus } from "@orderly.network/types";
import { useOrderListScript } from "@orderly.network/ui-orders/src/components/orderList/orderList.script";

const mocks = vi.hoisted(() => ({
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
      data: loader ? [{ rows: [], meta: { total: 0 } }] : undefined,
      mutate: mocks.refresh,
      setSize: vi.fn(),
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
function Native({ enableBinaryInfo = true }: { enableBinaryInfo?: boolean }) {
  useBinaryInfoObserver(enableBinaryInfo);
  const cancellation = useProductOrderCancelAll({ instrument: "perps" });
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
  mocks.mutation.mockResolvedValue({ success: true });
  mocks.refresh.mockResolvedValue(undefined);
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
it.each([true, false])(
  "native PERPs keep cancellation and issue no extra Binary queries (observer=%s)",
  async (enableBinaryInfo) => {
    act(() => {
      root = create(<Native enableBinaryInfo={enableBinaryInfo} />);
    });
    expect(mocks.publicQuery).toHaveBeenCalledTimes(1);
    expect(mocks.publicQuery).toHaveBeenCalledWith(
      enableBinaryInfo ? "/v1/public/binary/info" : null,
      expect.objectContaining({ refreshInterval: 60000 }),
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
