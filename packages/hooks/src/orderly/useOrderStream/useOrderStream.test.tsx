import { act, renderHook } from "@testing-library/react";
import {
  AlgoOrderRootType,
  OrderEntity,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { createMockSymbolConfig } from "../../services/orderCreator/__test__/testHelpers";
import { useOrderStream } from "./useOrderStream";
import { useSubAccountAlgoOrderStream } from "./useSubAccountAlgoOrderStream";

const mockUpdateAlgoOrder = jest.fn().mockResolvedValue({ success: true });
const mockSymbolInfo = createMockSymbolConfig();
let mockOrders: any[];
let mockMarkPrice: number;

jest.mock("../../provider/dataCenter/dataCenterContext", () => ({
  useDataCenterContext: () => ({}),
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
  usePrivateInfiniteQuery: (key: () => string) => ({
    data: [{ rows: key().includes("/algo/orders") ? mockOrders : [] }],
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

describe("useOrderStream TP/SL updates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
