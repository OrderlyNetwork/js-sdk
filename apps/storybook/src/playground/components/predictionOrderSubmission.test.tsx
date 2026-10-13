import { useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import type { PlaceOrderInput } from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useOrderSubmission";
import { usePredictionTradingActions } from "@orderly.network/prediction/src/prediction/hooks/usePredictionTradingActions";
import type { PredictionDataTab } from "@orderly.network/prediction/src/prediction/prediction.types";

const mocks = vi.hoisted(() => ({
  createOrder: vi.fn(),
  refreshOrders: vi.fn(),
  refreshPositions: vi.fn(),
  onSubmitted: vi.fn(),
  notify: vi.fn(),
  onActiveTab: vi.fn(),
  available: 100,
}));
vi.mock("@orderly.network/hooks", () => ({
  useMutation: () => [mocks.createOrder, {}],
  useSubAccountMutation: () => [vi.fn(), {}],
}));
vi.mock("@orderly.network/i18n", () => ({ i18n: { t: (key: string) => key } }));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountActions",
  () => ({
    usePredictionAccountActions: ({
      binaryRows,
    }: {
      binaryRows: BinaryInfoRow[];
    }) => ({
      configBySymbol: new Map(binaryRows.map((row) => [row.symbol, row])),
      hasFeeConfig: true,
      refreshOrders: mocks.refreshOrders,
      bulkCancellationMounted: { current: true },
      actions: {},
    }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/tradingActions/useTradingEstimates",
  () => ({
    useTradingEstimates: () => ({
      availableQuantity: () => mocks.available,
      estimateAdditionalFrozen: () => 10,
      protectionPrice: (_outcome: string, side: string) =>
        side === "buy" ? 0.64 : 0.36,
      isOrderTradable: () => true,
    }),
  }),
);

const symbol = "PERP_BTC5M2610131200_USDC";
let root: ReactTestRenderer | undefined;
let actions: ReturnType<typeof usePredictionTradingActions>;
let activeTab: PredictionDataTab;
let selectTab: (tab: PredictionDataTab) => void;
function Consumer({ initialTab }: { initialTab: PredictionDataTab }) {
  [activeTab, selectTab] = useState(initialTab);
  actions = usePredictionTradingActions({
    resources: {
      accountState: { accountId: "main" },
      accountReady: true,
      balance: 100,
      getCollateralSnapshot: () => ({
        positionQty: 0,
        pendingBuyQty: 0,
        pendingSellQty: 0,
        orders: [],
        reservations: [],
        mode: "detailed",
      }),
      refreshAccountPositions: mocks.refreshPositions,
    } as any,
    binaryRows: [
      {
        symbol,
        status: "ACTIVE",
        expire_at: Date.now() + 60000,
        base_tick: 0.01,
        base_min: 0.01,
        base_max: 10000,
        quote_tick: 0.01,
        min_notional: 5,
      } as BinaryInfoRow,
    ],
    selectedSymbol: symbol,
    bbo: { bestAsk: 0.59, bestBid: 0.41 },
    book: {
      asks: [[0.59, 100]],
      bids: [[0.41, 100]],
      downAsks: [[0.59, 100]],
      downBids: [[0.41, 100]],
    },
    slippage: "5",
    isRegionRestricted: false,
    notify: mocks.notify,
    onSubmitted: mocks.onSubmitted,
    onActiveTab: (tab) => {
      mocks.onActiveTab(tab);
      selectTab(tab);
    },
  });
  return null;
}
function mount(initialTab: PredictionDataTab = "predictions") {
  act(() => {
    root = create(<Consumer initialTab={initialTab} />);
  });
}
const input = (
  orderType: PlaceOrderInput["orderType"],
  orderSide: PlaceOrderInput["orderSide"] = "buy",
): PlaceOrderInput => ({
  canPlaceOrder: true,
  orderSide,
  orderType,
  selectedOutcome: "up",
  selectedPrice: 0.5,
  orderQuantity: 10,
  onResetAmountAfterFill: vi.fn(),
  clearNotification: vi.fn(),
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.available = 100;
  mocks.createOrder.mockResolvedValue({ success: true, data: { order_id: 1 } });
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

const cases = (
  [
    "predictions",
    "openOrders",
    "filled",
    "orderHistory",
    "predictionHistory",
    "history",
  ] as const
).flatMap((tab) =>
  (["limit", "market"] as const).flatMap((type) =>
    (["buy", "sell"] as const).map((side) => [tab, type, side] as const),
  ),
);
it.each(cases)(
  "keeps %s after a %s %s order and refreshes data",
  async (tab, type, side) => {
    mount(tab);
    const order = input(type, side);
    await act(async () => actions.placeOrder(order));
    expect(mocks.createOrder).toHaveBeenCalledTimes(1);
    expect(activeTab).toBe(tab);
    expect(mocks.onActiveTab).not.toHaveBeenCalled();
    expect(order.clearNotification).toHaveBeenCalledTimes(1);
    expect(order.onResetAmountAfterFill).toHaveBeenCalledTimes(1);
    expect(mocks.refreshOrders).toHaveBeenCalledWith("main");
    expect(mocks.refreshPositions).toHaveBeenCalledTimes(1);
    expect(mocks.onSubmitted).toHaveBeenCalledTimes(1);
    expect(mocks.notify).not.toHaveBeenCalled();
  },
);

it.each(["limit", "market"] as const)(
  "keeps a tab selected while the %s order is pending",
  async (type) => {
    let finish!: (response: unknown) => void;
    mocks.createOrder.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    mount();
    const order = input(type);
    let pending!: Promise<void>;
    act(() => {
      pending = actions.placeOrder(order);
    });
    expect(actions.isSubmitting).toBe(true);
    act(() => selectTab("filled"));
    await act(async () => {
      finish({ success: true, data: { order_id: 1 } });
      await pending;
    });
    expect(activeTab).toBe("filled");
    expect(mocks.onActiveTab).not.toHaveBeenCalled();
    expect(order.onResetAmountAfterFill).toHaveBeenCalledTimes(1);
    expect(actions.isSubmitting).toBe(false);
  },
);

it.each(["limit", "market"] as const)(
  "keeps input and reports rejection for a failed %s order",
  async (type) => {
    mocks.createOrder.mockResolvedValue({
      success: false,
      message: "Order rejected",
    });
    mount("filled");
    const order = input(type);
    await act(async () => actions.placeOrder(order));
    expect(activeTab).toBe("filled");
    expect(mocks.onActiveTab).not.toHaveBeenCalled();
    expect(order.clearNotification).toHaveBeenCalledTimes(1);
    expect(order.onResetAmountAfterFill).not.toHaveBeenCalled();
    expect(mocks.notify).toHaveBeenCalledWith("Order rejected", "danger");
    expect(mocks.refreshOrders).toHaveBeenCalledWith("main");
    expect(mocks.refreshPositions).toHaveBeenCalledTimes(1);
    expect(mocks.onSubmitted).not.toHaveBeenCalled();
  },
);

it("keeps the selected tab through consecutive limit and market submissions", async () => {
  mount("predictions");
  await act(async () => actions.placeOrder(input("limit")));
  await act(async () => actions.placeOrder(input("market")));
  expect(activeTab).toBe("predictions");
  expect(mocks.onActiveTab).not.toHaveBeenCalled();
  expect(mocks.createOrder).toHaveBeenCalledTimes(2);
  expect(mocks.refreshOrders).toHaveBeenCalledTimes(2);
  expect(mocks.refreshPositions).toHaveBeenCalledTimes(2);
});

it.each(
  (["up", "down"] as const).flatMap((outcome) =>
    (["market", "limit"] as const).flatMap((type) =>
      [12.26, 1].map((quantity) => [outcome, type, quantity] as const),
    ),
  ),
)(
  "submits small %s %s reduce-only sells of %s shares",
  async (outcome, type, quantity) => {
    mocks.available = 12.26;
    mount();
    const order = {
      ...input(type, "sell"),
      selectedOutcome: outcome,
      orderQuantity: quantity,
    };
    await act(async () => actions.placeOrder(order));
    expect(mocks.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        reduce_only: true,
        order_quantity: String(quantity),
      }),
    );
    expect(mocks.notify).not.toHaveBeenCalled();
  },
);
it("rejects small opening and oversized reduce-only orders at submission", async () => {
  mocks.available = 12.26;
  mount();
  await act(async () =>
    actions.placeOrder({ ...input("limit"), orderQuantity: 1 }),
  );
  await act(async () =>
    actions.placeOrder({ ...input("limit", "sell"), orderQuantity: 13.26 }),
  );
  expect(mocks.createOrder).not.toHaveBeenCalled();
});
