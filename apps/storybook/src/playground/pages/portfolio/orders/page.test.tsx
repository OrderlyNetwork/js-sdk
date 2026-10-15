import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductOrdersWidget as MixedOrders } from "@orderly.network/portfolio/src/pages/orders/productOrders.widget";

const mocks = vi.hoisted(() => ({
  state: null as any,
  orderListProps: {} as any,
  cancelAllDisabled: false as boolean | undefined,
  nativeCancel: vi.fn(async () => true),
  sdkCancel: vi.fn(async () => true),
  script: vi.fn(),
  table: vi.fn(),
  cancellation: vi.fn(),
  perpsDataSource: [] as any[],
}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: any) =>
      actual.useState(initial === "all" ? "up" : initial),
  };
});
vi.mock("@orderly.network/hooks", () => ({
  useAccount: () => ({ state: { accountId: "account-1" } }),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/prediction", async () => {
  const { hasPredictionExecutions } =
    await import("@orderly.network/prediction/src/prediction/binary/binaryOrderDisplay");
  const { binaryOrderPlainText } =
    await import("@orderly.network/prediction/src/prediction/binary/binaryOrderPlainText");
  const { binaryOrderDisplaySide, toPredictionStatus } =
    await import("@orderly.network/prediction/src/prediction/binary/binaryOrderDisplay");
  return {
    binaryOrderDisplaySide,
    binaryOrderPlainText,
    toPredictionOrderStatus: toPredictionStatus,
    useBinaryOrderRows: ({ enabled, mode }: any) => ({
      rows: !enabled
        ? []
        : mode === "pending"
          ? (mocks.state?.openOrders ?? [])
          : mode === "filled"
            ? (mocks.state?.history ?? []).filter(hasPredictionExecutions)
            : [
                ...(mocks.state?.openOrders ?? []),
                ...(mocks.state?.history ?? []),
              ],
      hasMore: false,
    }),
    PredictionOrderCell: () => null,
    usePredictionAccountData: () => mocks.state,
    hasPredictionExecutions,
    useProductOrderCancelAll: (options: unknown) => {
      mocks.cancellation(options);
      return {
        disabled: mocks.cancelAllDisabled,
        orderListProps: mocks.orderListProps,
      };
    },
  };
});
vi.mock("@orderly.network/react-app", () => ({ useCanTrade: () => true }));
vi.mock("@orderly.network/ui", () => ({
  Box: () => null,
  Button: () => null,
  Divider: () => null,
  Select: { options: () => null },
  Tabs: () => null,
  TabPanel: () => null,
  Text: () => null,
}));
vi.mock("@orderly.network/ui-orders", () => ({
  TabType: {
    all: "all",
    pending: "pending",
    filled: "filled",
    cancelled: "cancelled",
    rejected: "rejected",
    tp_sl: "tp_sl",
  },
  DesktopOrderList: (props: unknown) => {
    mocks.table(props);
    return null;
  },
  useOrderListScript: (options: unknown) => {
    mocks.script(options);
    return {
      filterItems: [{ name: "side", value: "BUY" }],
      dataSource: mocks.perpsDataSource,
      pagination: { page: 1, pageSize: 50, count: 0 },
      manualPagination: false,
      onCancelAll: mocks.nativeCancel,
    };
  },
}));
function render(product: string, type = "pending") {
  renderToStaticMarkup(
    createElement(MixedOrders, {
      product,
      type: type as any,
      ordersRef: { current: null },
    }),
  );
  return {
    script: mocks.script.mock.calls.at(-1)![0],
    table: mocks.table.mock.calls.at(-1)![0],
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.cancelAllDisabled = false;
  mocks.sdkCancel.mockResolvedValue(true);
  mocks.perpsDataSource = [];
  mocks.orderListProps = {
    cancelAllDisabled: false,
    onCancelAll: mocks.sdkCancel,
  };
  mocks.state = {
    openOrders: [
      {
        id: "down-sell",
        symbol: "PERP_BTC5M2610091200_USDC",
        outcome: "down",
        // Sell DOWN closes DOWN shares with a reduce-only BUY in the UP book.
        side: "buy",
        reduceOnly: true,
      },
    ],
    history: [],
  };
});
describe("SDK cancellation wiring", () => {
  it.each(["all", "perps", "prediction"])(
    "%s binds SDK state and confirmation directly without passing display filters",
    async (product) => {
      const { script, table } = render(product);
      expect(mocks.cancellation).toHaveBeenCalledWith({
        binary: product === "perps" ? undefined : mocks.state,
        enabled: true,
        instrument: product,
      });
      expect(table.dataSource).toEqual([]);
      expect(table.supplementalRows).toEqual([]);
      expect(table.onCancelAll).toBe(mocks.sdkCancel);
      expect(table.cancelAllDisabled).toBe(false);
      expect(script.cancelAllDisabled).toBe(false);
      expect(await table.onCancelAll()).toBe(true);
      expect(mocks.nativeCancel).not.toHaveBeenCalled();
    },
  );
  it("propagates SDK failure instead of wrapping it as success", async () => {
    mocks.sdkCancel.mockResolvedValue(false);
    const { table } = render("prediction");
    expect(await table.onCancelAll()).toBe(false);
  });
  it("uses SDK disabled state even when display filters hide all orders", () => {
    mocks.cancelAllDisabled = true;
    mocks.orderListProps.cancelAllDisabled = true;
    const { script, table } = render("prediction");
    expect(script.cancelAllDisabled).toBe(true);
    expect(table.cancelAllDisabled).toBe(true);
  });
  it("preserves the native fallback supplied by the SDK", () => {
    mocks.state = null;
    mocks.cancelAllDisabled = undefined;
    mocks.orderListProps = {};
    const { script, table } = render("perps");
    expect(script.cancelAllDisabled).toBeUndefined();
    expect(table.onCancelAll).toBe(mocks.nativeCancel);
  });
  it("keeps TP/SL confirmation and cancellation independent of pending SDK state", () => {
    mocks.cancelAllDisabled = true;
    const { script, table } = render("all", "tp_sl");
    expect(mocks.cancellation).toHaveBeenCalledWith({
      binary: mocks.state,
      enabled: false,
      instrument: "all",
    });
    expect(script.cancelAllDisabled).toBeUndefined();
    expect(table.onCancelAll).toBe(mocks.nativeCancel);
  });
});

describe("outcome filter scope", () => {
  it("shows the outcome select only in the prediction instrument view", () => {
    const all = render("all").table;
    expect(
      all.filterItems?.some(
        (item: { name: string }) => item.name === "outcome",
      ),
    ).toBe(false);
    const prediction = render("prediction").table;
    expect(
      prediction.filterItems?.some(
        (item: { name: string }) => item.name === "outcome",
      ),
    ).toBe(true);
  });
  it("keeps perps rows visible in the merged view and hidden in prediction", () => {
    mocks.perpsDataSource = [{ symbol: "PERP_BTC_USDC", order_id: 1 }];
    expect(render("all").table.dataSource).toEqual([
      { symbol: "PERP_BTC_USDC", order_id: 1 },
    ]);
    expect(render("prediction").table.dataSource).toEqual([]);
  });
  it("filled keeps executed market orders that terminated cancelled", () => {
    mocks.state = {
      openOrders: [],
      history: [
        {
          id: "ioc-partial",
          symbol: "PERP_BTC5M2610091200_USDC",
          outcome: "up",
          side: "buy",
          status: "cancelled",
          filledQuantity: 40,
          quantity: 100,
          timestamp: 3,
        },
        {
          id: "full",
          symbol: "PERP_BTC5M2610091200_USDC",
          outcome: "up",
          side: "buy",
          status: "filled",
          filledQuantity: 100,
          quantity: 100,
          timestamp: 2,
        },
        {
          id: "no-fill",
          symbol: "PERP_BTC5M2610091200_USDC",
          outcome: "down",
          side: "buy",
          status: "cancelled",
          filledQuantity: 0,
          quantity: 100,
          timestamp: 4,
        },
        {
          id: "working",
          symbol: "PERP_BTC5M2610091200_USDC",
          outcome: "up",
          side: "buy",
          status: "partialFilled",
          filledQuantity: 10,
          quantity: 100,
          timestamp: 1,
        },
      ],
    };
    const { table } = render("all", "filled");
    expect(
      table.supplementalRows?.map((row: { id: string }) => row.id),
    ).toEqual(["prediction-ioc-partial", "prediction-full"]);
  });
});
