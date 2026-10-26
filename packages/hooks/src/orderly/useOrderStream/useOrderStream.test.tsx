import { act, renderHook } from "@testing-library/react";
import {
  AlgoOrderRootType,
  OrderEntity,
  OrderSide,
  OrderStatus,
  OrderType,
} from "@orderly.network/types";
import { createOrderKeyRegistry } from "../../provider/dataCenter/orderKeyRegistry";
import { createMockSymbolConfig } from "../../services/orderCreator/__test__/testHelpers";
import { useOrderStream } from "./useOrderStream";
import { useSubAccountAlgoOrderStream } from "./useSubAccountAlgoOrderStream";

const mockUpdateAlgoOrder = jest.fn().mockResolvedValue({ success: true });
const mockSymbolInfo = createMockSymbolConfig();
let mockOrders: any[];
let mockNormalOrders: any[];
let mockMarkPrice: number;
let mockDataCenter: any = {};

jest.mock("../../provider/dataCenter/dataCenterContext", () => ({
  useDataCenterContext: () => mockDataCenter,
}));
jest.mock("../../useMutation", () => ({
  useMutation: () => [mockUpdateAlgoOrder, {}],
}));
jest.mock("../../subAccount", () => ({
  useSubAccountMutation: () => [mockUpdateAlgoOrder, {}],
  useSubAccountQuery: () => ({ data: { rows: mockOrders }, mutate: jest.fn() }),
}));
jest.mock("../../useEventEmitter", () => ({
  useEventEmitter: () => ({ on: jest.fn(), off: jest.fn() }),
}));
jest.mock("../../usePrivateInfiniteQuery", () => ({
  usePrivateInfiniteQuery: (key: (() => string) | null) => ({
    data: [
      {
        rows: key?.().includes("/algo/orders") ? mockOrders : mockNormalOrders,
      },
    ],
    mutate: jest.fn(),
  }),
}));
jest.mock("../useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({ data: { PERP_ETH_USDC: mockMarkPrice } }),
}));
jest.mock("../useSymbolsInfo", () => ({
  useSymbolsInfo: () => ({ PERP_ETH_USDC: () => mockSymbolInfo }),
}));

const createOrder = (fullPosition = false) => ({
  algo_order_id: 10,
  algo_type: fullPosition
    ? AlgoOrderRootType.POSITIONAL_TP_SL
    : AlgoOrderRootType.TP_SL,
  symbol: "PERP_ETH_USDC",
  is_triggered: false,
  child_orders: [
    {
      algo_order_id: 11,
      parent_algo_order_id: 10,
      root_algo_order_id: 10,
      algo_type: "TAKE_PROFIT",
      type: OrderType.LIMIT,
      side: OrderSide.SELL,
      quantity: 1,
      trigger_price: 4100,
      price: 4130,
      is_activated: true,
      is_triggered: false,
    },
  ],
});

describe("useOrderStream bulk cancellation", () => {
  beforeEach(() => {
    mockUpdateAlgoOrder.mockReset().mockResolvedValue({ success: true });
    mockOrders = [createOrder()];
    mockNormalOrders = [];
    mockMarkPrice = 4000;
  });

  it("keeps pending cancellation scoped to symbol and independent of display filters", async () => {
    const { result } = renderHook(() =>
      useOrderStream({ side: OrderSide.BUY }),
    );
    await result.current[1].cancelAllPendingOrders("PERP_BTC_USDC");
    expect(mockUpdateAlgoOrder.mock.calls).toEqual([
      [null, { symbol: "PERP_BTC_USDC" }],
      [null, { symbol: "PERP_BTC_USDC", algo_type: AlgoOrderRootType.STOP }],
      [
        null,
        { symbol: "PERP_BTC_USDC", algo_type: AlgoOrderRootType.TRAILING_STOP },
      ],
    ]);
  });

  it("scopes a PERP unscoped cancel-all to perp symbols only, symbol by symbol", async () => {
    mockOrders = [];
    mockNormalOrders = [
      { order_id: 1, symbol: "PERP_BTC_USDC" },
      { order_id: 2, symbol: "PERP_ETH_USDC" },
      { order_id: 3, symbol: "PERP_ETH_USDC" },
      { order_id: 4, symbol: "PERP_BTC5M2608271200_USDC" },
    ];
    const { result } = renderHook(() =>
      useOrderStream({
        status: OrderStatus.INCOMPLETE,
        productType: "PERP",
        size: 500,
      }),
    );
    await result.current[1].cancelAllPendingOrders();
    expect(mockUpdateAlgoOrder.mock.calls).toEqual([
      [null, { symbol: "PERP_BTC_USDC" }],
      [null, { symbol: "PERP_BTC_USDC", algo_type: AlgoOrderRootType.STOP }],
      [
        null,
        { symbol: "PERP_BTC_USDC", algo_type: AlgoOrderRootType.TRAILING_STOP },
      ],
      [null, { symbol: "PERP_ETH_USDC" }],
      [null, { symbol: "PERP_ETH_USDC", algo_type: AlgoOrderRootType.STOP }],
      [
        null,
        { symbol: "PERP_ETH_USDC", algo_type: AlgoOrderRootType.TRAILING_STOP },
      ],
    ]);
  });

  it("keeps the legacy unscoped cancel-all for streams without a product filter", async () => {
    const { result } = renderHook(() => useOrderStream({}));
    await result.current[1].cancelAllPendingOrders();
    expect(mockUpdateAlgoOrder.mock.calls).toEqual([
      [null, {}],
      [null, { algo_type: AlgoOrderRootType.STOP }],
      [null, { algo_type: AlgoOrderRootType.TRAILING_STOP }],
    ]);
  });

  it("preserves the two independent TP/SL cancellation types", async () => {
    const { result } = renderHook(() => useOrderStream({}));
    await result.current[1].cancelAllTPSLOrders("PERP_BTC_USDC");
    expect(mockUpdateAlgoOrder.mock.calls).toEqual([
      [
        null,
        {
          symbol: "PERP_BTC_USDC",
          algo_type: AlgoOrderRootType.POSITIONAL_TP_SL,
        },
      ],
      [null, { symbol: "PERP_BTC_USDC", algo_type: AlgoOrderRootType.TP_SL }],
    ]);
  });

  it("rejects backend failures rather than returning a fulfilled batch", async () => {
    mockUpdateAlgoOrder.mockResolvedValueOnce({
      success: false,
      message: "CANCEL_REJECTED",
    });
    const { result } = renderHook(() => useOrderStream({}));
    await expect(result.current[1].cancelAllPendingOrders()).rejects.toThrow(
      "CANCEL_REJECTED",
    );
    expect(mockUpdateAlgoOrder).toHaveBeenCalledTimes(3);
  });

  it("awaits other submitted requests before rejecting a partial failure", async () => {
    let finish!: () => void;
    mockUpdateAlgoOrder
      .mockRejectedValueOnce(new Error("FAILED"))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = () => resolve({ success: true });
          }),
      );
    const { result } = renderHook(() => useOrderStream({}));
    const rejected = jest.fn();
    const pending = result.current[1]
      .cancelAllPendingOrders()
      .catch((error) => rejected(error.message));
    await Promise.resolve();
    expect(rejected).not.toHaveBeenCalled();
    finish();
    await pending;
    expect(rejected).toHaveBeenCalledWith("FAILED");
  });
});

describe("useOrderStream TP/SL updates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateAlgoOrder.mockReset().mockResolvedValue({ success: true });
    mockOrders = [createOrder()];
    mockMarkPrice = 4000;
  });

  it.each([undefined, "4120"])(
    "preserves partial-position quantity when the new price is %s",
    async (price) => {
      const { result } = renderHook(() => useOrderStream({}));
      await act(async () => {
        await result.current[1].updateAlgoOrder("11", {
          order_quantity: "2",
          order_price: price,
        } as OrderEntity);
      });
      expect(mockUpdateAlgoOrder).toHaveBeenCalledWith({
        order_id: 10,
        child_orders: [
          { order_id: 11, quantity: 2, ...(price && { price: 4120 }) },
        ],
      });
    },
  );

  it("omits quantities when editing an entire-position leg", async () => {
    mockOrders = [createOrder(true)];
    const { result } = renderHook(() => useOrderStream({}));
    await act(async () => {
      await result.current[1].updateAlgoOrder("11", {
        order_quantity: "2",
        order_price: "4120",
      } as OrderEntity);
    });
    expect(mockUpdateAlgoOrder).toHaveBeenCalledWith({
      order_id: 10,
      child_orders: [{ order_id: 11, price: 4120 }],
    });
  });

  it.each([
    { fullPosition: false, parentTriggered: true, childTriggered: false },
    { fullPosition: true, parentTriggered: true, childTriggered: false },
    { fullPosition: false, parentTriggered: false, childTriggered: true },
  ])("allows triggered Limit price edits with %j", async (state) => {
    mockOrders = [createOrder(state.fullPosition)];
    mockOrders[0].is_triggered = state.parentTriggered;
    mockOrders[0].child_orders[0].is_triggered = state.childTriggered;
    mockMarkPrice = 4110;
    const { result } = renderHook(() => useOrderStream({}));
    await act(async () => {
      await result.current[1].updateAlgoOrder("11", {
        order_type: OrderType.LIMIT,
        order_price: "4120",
        trigger_price: "4100.00",
      } as OrderEntity);
    });
    expect(mockUpdateAlgoOrder).toHaveBeenCalledWith({
      order_id: 10,
      child_orders: [{ order_id: 11, price: 4120 }],
    });
  });

  it("uses the TP/SL parent stage for nested Bracket updates", async () => {
    const parent = createOrder();
    parent.is_triggered = true;
    parent.child_orders[0].root_algo_order_id = 20;
    mockOrders = [
      {
        algo_order_id: 20,
        algo_type: AlgoOrderRootType.BRACKET,
        symbol: parent.symbol,
        child_orders: [parent],
      },
    ];
    mockMarkPrice = 4110;
    const { result } = renderHook(() => useOrderStream({}));
    await act(async () => {
      await result.current[1].updateTPSLOrder(20, [
        { order_id: 10, child_orders: [{ order_id: 11, price: 4120 }] },
      ]);
    });
    expect(mockUpdateAlgoOrder).toHaveBeenCalledWith({
      order_id: 20,
      child_orders: [
        { order_id: 10, child_orders: [{ order_id: 11, price: 4120 }] },
      ],
    });
  });

  it.each([
    { triggered: false, price: "4120", trigger: "4100" },
    { triggered: true, price: "4120", trigger: "4090" },
    { triggered: true, price: "0", trigger: "4100" },
    { triggered: true, price: "100", trigger: "4100" },
  ])(
    "retains price validation for %j",
    async ({ triggered, price, trigger }) => {
      mockOrders[0].is_triggered = triggered;
      mockMarkPrice = 4110;
      const { result } = renderHook(() => useOrderStream({}));
      await act(async () => {
        await expect(
          result.current[1].updateAlgoOrder("11", {
            order_price: price,
            trigger_price: trigger,
          } as OrderEntity),
        ).rejects.toThrow();
      });
      expect(mockUpdateAlgoOrder).not.toHaveBeenCalled();
    },
  );
});

describe("useOrderStream resource release", () => {
  beforeEach(() => {
    mockOrders = [];
    mockMarkPrice = 4000;
  });
  afterEach(() => {
    mockDataCenter = {};
  });
  it("keeps a shared key until its last consumer disables or unmounts", () => {
    const registry = createOrderKeyRegistry();
    mockDataCenter = {
      registerKeyHandler: registry.register,
      unregisterKeyHandler: registry.unregister,
    };
    const first = renderHook(
      ({ enabled }) =>
        useOrderStream(
          { productType: "BINARY" },
          { enabled, stopOnUnmount: true },
        ),
      { initialProps: { enabled: true } },
    );
    const second = renderHook(() =>
      useOrderStream({ productType: "BINARY" }, { stopOnUnmount: true }),
    );
    const count = registry.handlers.size;
    expect(count).toBeGreaterThan(0);
    first.rerender({ enabled: false });
    expect(registry.handlers.size).toBe(count);
    second.unmount();
    expect(registry.handlers.size).toBe(0);
    first.unmount();
  });
  it("preserves the default cache retention after a legacy consumer unmounts", () => {
    const registry = createOrderKeyRegistry();
    mockDataCenter = {
      registerKeyHandler: registry.register,
      unregisterKeyHandler: registry.unregister,
    };
    const legacy = renderHook(() => useOrderStream({ productType: "PERP" }));
    const count = registry.handlers.size;
    legacy.unmount();
    expect(registry.handlers.size).toBe(count);
    expect(count).toBeGreaterThan(0);
  });
});

describe.each(["main", "sub"])("%s account TP/SL policy", (account) => {
  const useStream = () =>
    account === "main"
      ? useOrderStream({})
      : useSubAccountAlgoOrderStream({}, { accountId: "sub-account" });
  beforeEach(() => {
    jest.clearAllMocks();
    const parent = createOrder();
    parent.child_orders[0].is_activated = false;
    parent.child_orders[0].root_algo_order_id = 20;
    mockOrders = [
      {
        algo_order_id: 20,
        algo_type: "BRACKET",
        symbol: parent.symbol,
        child_orders: [parent],
      },
    ];
    mockMarkPrice = 4000;
  });

  it("rejects pending Bracket type changes before making a request", async () => {
    const { result } = renderHook(useStream);
    await act(async () => {
      await expect(
        Promise.resolve().then(() =>
          result.current[1].updateTPSLOrder(20, [
            {
              order_id: 10,
              child_orders: [
                { order_id: 11, type: OrderType.MARKET, trigger_price: 4105 },
              ],
            },
          ]),
        ),
      ).rejects.toThrow(/type/);
    });
    expect(mockUpdateAlgoOrder).not.toHaveBeenCalled();
  });

  it("allows legitimate nested placeholder activation", async () => {
    mockOrders[0].child_orders[0].is_activated = true;
    const { result } = renderHook(useStream);
    await act(async () => {
      await result.current[1].updateTPSLOrder(20, [
        {
          order_id: 10,
          child_orders: [
            { order_id: 11, type: OrderType.MARKET, trigger_price: 4105 },
          ],
        },
      ]);
    });
    expect(mockUpdateAlgoOrder).toHaveBeenCalledWith({
      order_id: 20,
      child_orders: [
        {
          order_id: 10,
          child_orders: [
            { order_id: 11, order_type: OrderType.MARKET, trigger_price: 4105 },
          ],
        },
      ],
    });
  });

  it("rejects unchanged triggers without making a request", async () => {
    mockOrders[0].child_orders[0].is_activated = true;
    const { result } = renderHook(useStream);
    await act(async () => {
      await expect(
        Promise.resolve().then(() =>
          result.current[1].updateTPSLOrder(20, [
            {
              order_id: 10,
              child_orders: [
                {
                  order_id: 11,
                  type: OrderType.MARKET,
                  trigger_price: "4100.00",
                },
              ],
            },
          ]),
        ),
      ).rejects.toThrow(/trigger price/);
    });
    expect(mockUpdateAlgoOrder).not.toHaveBeenCalled();
  });

  it("only sends a changed Pending leg and skips an unchanged sibling", async () => {
    const parent = mockOrders[0].child_orders[0];
    parent.is_activated = false;
    parent.child_orders.push({
      ...parent.child_orders[0],
      algo_order_id: 12,
      algo_type: "STOP_LOSS",
      type: OrderType.MARKET,
      trigger_price: 3900,
    });
    const { result } = renderHook(useStream);
    const unchanged = [
      { order_id: 11, type: OrderType.LIMIT, trigger_price: 4100, price: 4130 },
      { order_id: 12, type: OrderType.MARKET, trigger_price: 3900 },
    ];
    await act(async () => {
      await result.current[1].updateTPSLOrder(20, [
        { order_id: 10, child_orders: unchanged },
      ]);
    });
    expect(mockUpdateAlgoOrder).not.toHaveBeenCalled();
    await act(async () => {
      await result.current[1].updateTPSLOrder(20, [
        {
          order_id: 10,
          child_orders: [
            { ...unchanged[0], trigger_price: 4105 },
            unchanged[1],
          ],
        },
      ]);
    });
    expect(mockUpdateAlgoOrder).toHaveBeenCalledWith({
      order_id: 20,
      child_orders: [
        { order_id: 10, child_orders: [{ order_id: 11, trigger_price: 4105 }] },
      ],
    });
  });

  it("explicitly cancels a configured Pending leg", async () => {
    mockOrders[0].child_orders[0].is_activated = false;
    const { result } = renderHook(useStream);
    await act(async () => {
      await result.current[1].updateTPSLOrder(20, [
        {
          order_id: 10,
          child_orders: [
            { order_id: 11, is_activated: false, trigger_price: 0, price: 0 },
          ],
        },
      ]);
    });
    expect(mockUpdateAlgoOrder).toHaveBeenCalledWith({
      order_id: 20,
      child_orders: [
        { order_id: 10, child_orders: [{ order_id: 11, is_activated: false }] },
      ],
    });
  });
});
