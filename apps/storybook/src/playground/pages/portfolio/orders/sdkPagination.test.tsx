import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductOrdersWidget } from "@orderly.network/portfolio/src/pages/orders/productOrders.widget";

const mocks = vi.hoisted(() => ({
  accountId: "account-1",
  canTrade: true,
  perpsRows: [] as any[],
  binaryRows: [] as any[],
  binaryHasMore: false,
  perpsHasMore: false,
  validating: false,
  error: undefined as unknown,
  filters: [] as any[],
  table: {} as any,
  script: vi.fn(),
  binary: vi.fn(),
  account: vi.fn(),
  perpsMore: vi.fn(),
  binaryMore: vi.fn(),
}));
vi.mock("@orderly.network/hooks", () => ({
  useAccount: () => ({ state: { accountId: mocks.accountId } }),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/react-app", () => ({
  useCanTrade: () => mocks.canTrade,
}));
vi.mock("@orderly.network/ui", () => ({
  Text: ({ children }: any) => children,
}));
vi.mock("@orderly.network/prediction", async () => {
  const { binaryOrderPlainText } =
    await import("@orderly.network/prediction/src/prediction/binary/binaryOrderPlainText");
  const { toPredictionStatus } =
    await import("@orderly.network/prediction/src/prediction/binary/binaryOrderDisplay");
  return {
    binaryOrderPlainText,
    toPredictionOrderStatus: toPredictionStatus,
    PredictionOrderCell: () => null,
    usePredictionAccountData: (options: unknown) => {
      mocks.account(options);
      return {};
    },
    useProductOrderCancelAll: () => ({ orderListProps: {} }),
    useBinaryOrderRows: (options: any) => {
      mocks.binary(options);
      return {
        rows: options.enabled ? mocks.binaryRows : [],
        hasMore: options.enabled && mocks.binaryHasMore,
        isValidating: mocks.validating,
        loadMore: mocks.binaryMore,
        error: mocks.error,
      };
    },
  };
});
vi.mock("@orderly.network/ui-orders", () => ({
  TabType: {
    all: "all",
    pending: "pending",
    filled: "filled",
    cancelled: "cancelled",
    rejected: "rejected",
    tp_sl: "tp_sl",
  },
  DesktopOrderList: (props: any) => {
    mocks.table = props;
    return null;
  },
  useOrderListScript: (options: unknown) => {
    mocks.script(options);
    return {
      dataSource: mocks.perpsRows,
      filterItems: mocks.filters,
      onFilter: vi.fn(),
      hasMore: mocks.perpsHasMore,
      loadMore: mocks.perpsMore,
      isValidating: mocks.validating,
      sharePnLConfig: (options as any).sharePnLConfig,
    };
  },
}));

let renderer: ReactTestRenderer;
const props = {
  type: "all" as any,
  product: "all" as const,
  ordersRef: { current: null },
};
const order = (id: number) => ({
  id,
  symbol: "PERP_ETH15M2610091200_USDC",
  outcome: "up",
  side: "buy",
  type: "limit",
  price: 0.4,
  quantity: 100,
  filledQuantity: 40,
  averagePrice: 0.5,
  timestamp: id,
  round: 1,
  status: "cancelled",
});
function mount(overrides: Record<string, unknown> = {}) {
  act(() => {
    renderer = create(
      createElement(ProductOrdersWidget, { ...props, ...overrides }),
    );
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(mocks, {
    accountId: "account-1",
    canTrade: true,
    perpsRows: [],
    binaryRows: [],
    binaryHasMore: false,
    perpsHasMore: false,
    validating: false,
    error: undefined,
    filters: [],
  });
});
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
});

describe("SDK mixed order queries and pagination", () => {
  it("passes product-isolated queries and sharing configuration to the SDK lists", () => {
    const sharePnLConfig = { backgroundImages: ["custom.png"] };
    mount({ sharePnLConfig });
    expect(mocks.script).toHaveBeenCalledWith(
      expect.objectContaining({
        productType: "PERP",
        enabled: true,
        enableLoadMore: true,
        sharePnLConfig,
      }),
    );
    expect(mocks.binary).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true, mode: "history" }),
    );
    expect(mocks.account).toHaveBeenCalledWith({ enabled: true });
    expect(mocks.table.sharePnLConfig).toBe(sharePnLConfig);
  });
  it("requests subsequent pages at the boundary and renders more than 100 binary orders", () => {
    mocks.binaryRows = Array.from({ length: 50 }, (_, id) => order(id));
    mocks.binaryHasMore = true;
    mount();
    expect(mocks.binaryMore).not.toHaveBeenCalled();
    act(() => mocks.table.onMergedPageChange(3));
    expect(mocks.binaryMore).toHaveBeenCalledOnce();
    mocks.binaryRows = Array.from({ length: 150 }, (_, id) => order(id));
    act(() => renderer.update(createElement(ProductOrdersWidget, props)));
    expect(mocks.table.supplementalRows).toHaveLength(150);
    expect(mocks.table.mergedTotal).toBe(150);
  });
  it.each([10, 20, 50, 100])(
    "loads both products using the selected page size %i",
    (size) => {
      mocks.binaryRows = Array.from({ length: 40 }, (_, id) => order(id));
      mocks.perpsRows = Array.from({ length: 40 }, (_, id) => ({
        order_id: id,
        symbol: "PERP_ETH_USDC",
      }));
      mocks.binaryHasMore = true;
      mocks.perpsHasMore = true;
      mount();
      act(() => mocks.table.onMergedPageChange(2));
      mocks.binaryMore.mockClear();
      mocks.perpsMore.mockClear();
      act(() => mocks.table.onMergedPageSizeChange(size));
      expect(mocks.table.mergedPageSize).toBe(size);
      expect(mocks.binaryMore).toHaveBeenCalledTimes(size >= 40 ? 1 : 0);
      expect(mocks.perpsMore).toHaveBeenCalledTimes(size >= 40 ? 1 : 0);
      act(() => mocks.table.onMergedPageChange(5));
      expect(mocks.binaryMore).toHaveBeenCalledTimes(size >= 40 ? 2 : 1);
      expect(mocks.perpsMore).toHaveBeenCalledTimes(size >= 40 ? 2 : 1);
    },
  );
  it("continues sparse client-filtered pages and stops while validating or after exhaustion", () => {
    mocks.binaryHasMore = true;
    mount({ type: "filled" });
    expect(mocks.binaryMore).toHaveBeenCalledOnce();
    mocks.validating = true;
    act(() =>
      renderer.update(
        createElement(ProductOrdersWidget, { ...props, type: "filled" as any }),
      ),
    );
    expect(mocks.binaryMore).toHaveBeenCalledOnce();
    mocks.validating = false;
    mocks.binaryHasMore = false;
    act(() => renderer.update(createElement(ProductOrdersWidget, props)));
    expect(mocks.binaryMore).toHaveBeenCalledOnce();
  });
  it("deduplicates both products and strips cross-product WS rows before rendering or CSV", () => {
    mocks.binaryRows = [order(1), order(1)];
    mocks.perpsRows = [
      { order_id: 2, symbol: "PERP_ETH_USDC" },
      { order_id: 2, symbol: "PERP_ETH_USDC" },
      { order_id: 1, symbol: "PERP_ETH15M2610091200_USDC" },
    ];
    mount();
    expect(mocks.table.dataSource).toHaveLength(1);
    expect(mocks.table.supplementalRows).toHaveLength(1);
    expect(mocks.table.supplementalRows[0].plainText("executed")).toBe("20");
  });
  it("resets pagination on display filter or account changes", () => {
    mocks.binaryRows = Array.from({ length: 50 }, (_, id) => order(id));
    mocks.binaryHasMore = true;
    mount();
    act(() => mocks.table.onMergedPageChange(3));
    const initialScope = mocks.table.mergeResetKey;
    mocks.binaryMore.mockClear();
    mocks.filters = [{ name: "side", value: "SELL" }];
    act(() => renderer.update(createElement(ProductOrdersWidget, props)));
    expect(mocks.table.mergeResetKey).not.toBe(initialScope);
    expect(mocks.table.supplementalRows).toHaveLength(0);
    const filteredScope = mocks.table.mergeResetKey;
    mocks.accountId = "account-2";
    act(() => renderer.update(createElement(ProductOrdersWidget, props)));
    expect(mocks.table.mergeResetKey).not.toBe(filteredScope);
  });
  it("disables binary queries in Perps and TP/SL and leaves Prediction TP/SL empty", () => {
    mount({ product: "perps" });
    expect(mocks.binary).toHaveBeenLastCalledWith(
      expect.objectContaining({ enabled: false }),
    );
    expect(mocks.account).toHaveBeenLastCalledWith({ enabled: false });
    mocks.perpsRows = [{ order_id: 1, symbol: "PERP_ETH_USDC" }];
    act(() =>
      renderer.update(
        createElement(ProductOrdersWidget, {
          ...props,
          product: "prediction",
          type: "tp_sl" as any,
        }),
      ),
    );
    expect(mocks.binary).toHaveBeenLastCalledWith(
      expect.objectContaining({ enabled: false }),
    );
    expect(mocks.table.dataSource).toEqual([]);
    expect(mocks.table.supplementalRows).toEqual([]);
  });
  it("does not start private list loading for disconnected users or failed queries", () => {
    mocks.canTrade = false;
    mocks.binaryHasMore = true;
    mount();
    expect(mocks.binary).toHaveBeenLastCalledWith(
      expect.objectContaining({ enabled: false }),
    );
    expect(mocks.binaryMore).not.toHaveBeenCalled();
    mocks.canTrade = true;
    mocks.error = new Error("network");
    act(() => renderer.update(createElement(ProductOrdersWidget, props)));
    expect(mocks.binaryMore).not.toHaveBeenCalled();
    expect(JSON.stringify(renderer.toJSON())).toContain(
      "prediction.orders.loadError",
    );
  });
});
