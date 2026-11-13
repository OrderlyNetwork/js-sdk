import { act, renderHook } from "@testing-library/react";
import {
  AlgoOrderRootType,
  API,
  OrderSide,
  OrderStatus,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import { createMockSymbolConfig } from "../../../services/orderCreator/__test__/testHelpers";
import { useTaskProfitAndStopLossInternal } from "../useTPSL";

const mockCreateOrder = jest.fn().mockResolvedValue({ success: true });
const mockUpdateOrder = jest.fn().mockResolvedValue({ success: true });
const mockDeleteOrder = jest.fn().mockResolvedValue({ success: true });
let mockSymbolInfo = createMockSymbolConfig();
let mockMarkPrice = 4000;

jest.mock("../../../next/useOrderEntry/helper", () => ({
  appendOrderMetadata: (order: unknown) => order,
}));

jest.mock("../../../orderlyContext", () => ({
  useOrderlyContext: () => ({ orderMetadata: undefined }),
}));

jest.mock("../../../subAccount", () => ({
  useSubAccountMutation: (_url: string, method = "POST") => [
    method === "PUT" ? mockUpdateOrder : mockCreateOrder,
    { isMutating: false },
  ],
}));

jest.mock("../../../useMutation", () => ({
  useMutation: () => [mockDeleteOrder],
}));

jest.mock("../../useMarkPrice", () => ({
  useMarkPrice: () => ({ data: mockMarkPrice }),
}));

jest.mock("../../useSymbolsInfo", () => ({
  useSymbolsInfo: () => ({
    PERP_ETH_USDC: () => mockSymbolInfo,
  }),
}));

const existingFullOrder = {
  algo_order_id: 10,
  algo_type: AlgoOrderRootType.POSITIONAL_TP_SL,
  symbol: "PERP_ETH_USDC",
  quantity: 0,
  child_orders: [
    {
      algo_order_id: 11,
      algo_type: "TAKE_PROFIT",
      type: OrderType.CLOSE_POSITION,
      trigger_price: 4100,
      is_activated: true,
    },
    {
      algo_order_id: 12,
      algo_type: "STOP_LOSS",
      type: OrderType.CLOSE_POSITION,
      trigger_price: 3900,
      is_activated: true,
    },
  ],
} as API.AlgoOrder;

describe("useTPSLOrder create and edit routing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSymbolInfo = createMockSymbolConfig();
    mockMarkPrice = 4000;
  });

  it("creates a new partial order when defaultOrder is provided but isEditing is false", async () => {
    const { result } = renderHook(() =>
      useTaskProfitAndStopLossInternal(
        {
          symbol: "PERP_ETH_USDC",
          position_qty: 2,
          average_open_price: 4000,
        },
        {
          defaultOrder: existingFullOrder,
          isEditing: false,
          positionType: PositionType.PARTIAL,
        },
      ),
    );

    act(() => {
      result.current[1].setValues({
        quantity: 1,
        tp_trigger_price: 4200,
        tp_order_type: OrderType.MARKET,
      });
    });

    await act(async () => {
      await result.current[1].submit();
    });

    expect(mockUpdateOrder).not.toHaveBeenCalled();
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        algo_type: AlgoOrderRootType.TP_SL,
        quantity: 1,
        child_orders: [
          expect.objectContaining({
            algo_type: "TAKE_PROFIT",
            side: OrderSide.SELL,
            type: OrderType.MARKET,
            trigger_price: 4200,
          }),
        ],
      }),
      {},
      undefined,
    );
  });

  it("rejects reactivating a LIMIT TP without a trigger price", async () => {
    const orderWithInactiveTP = {
      ...existingFullOrder,
      child_orders: [
        {
          ...existingFullOrder.child_orders[0],
          type: OrderType.LIMIT,
          trigger_price: 0,
          is_activated: false,
        },
        {
          ...existingFullOrder.child_orders[1],
          type: OrderType.LIMIT,
          price: 3890,
        },
      ],
    } as API.AlgoOrder;

    const { result } = renderHook(() =>
      useTaskProfitAndStopLossInternal(
        {
          symbol: "PERP_ETH_USDC",
          position_qty: 2,
          average_open_price: 4000,
        },
        {
          defaultOrder: orderWithInactiveTP,
          isEditing: true,
          positionType: PositionType.FULL,
        },
      ),
    );

    act(() => {
      result.current[1].setValues({ tp_order_price: 4210 });
    });

    let validationError: unknown;
    await act(async () => {
      try {
        await result.current[1].validate();
      } catch (error) {
        validationError = error;
      }
    });

    expect(validationError).toMatchObject({
      tp_trigger_price: { type: "required" },
    });
    expect(result.current[1].metaState).toMatchObject({
      validated: true,
      errors: { tp_trigger_price: { type: "required" } },
    });
    expect(mockUpdateOrder).not.toHaveBeenCalled();
  });

  it("reactivates a default-market TP placeholder without changing its type", async () => {
    const orderWithInactiveTP = {
      ...existingFullOrder,
      child_orders: [
        {
          ...existingFullOrder.child_orders[0],
          type: OrderType.CLOSE_POSITION,
          trigger_price: 0,
          is_activated: false,
        },
        {
          ...existingFullOrder.child_orders[1],
          type: OrderType.LIMIT,
          price: 3890,
        },
      ],
    } as API.AlgoOrder;

    const { result } = renderHook(() =>
      useTaskProfitAndStopLossInternal(
        {
          symbol: "PERP_ETH_USDC",
          position_qty: 2,
          average_open_price: 4000,
        },
        {
          defaultOrder: orderWithInactiveTP,
          isEditing: true,
          positionType: PositionType.FULL,
        },
      ),
    );

    act(() => {
      result.current[1].setValues({
        tp_trigger_price: 4100,
        tp_order_price: 4110,
      });
    });

    await act(async () => {
      await result.current[1].submit();
    });

    expect(mockUpdateOrder).toHaveBeenCalledWith(
      {
        order_id: 10,
        child_orders: [{ order_id: 11, trigger_price: 4100 }],
      },
      {},
      undefined,
    );
  });

  it("reactivates an inactive full-position MARKET leg as LIMIT", async () => {
    const orderWithInactiveTP = {
      ...existingFullOrder,
      child_orders: [
        {
          ...existingFullOrder.child_orders[0],
          trigger_price: 0,
          is_activated: false,
        },
        existingFullOrder.child_orders[1],
      ],
    } as API.AlgoOrder;

    const { result } = renderHook(() =>
      useTaskProfitAndStopLossInternal(
        {
          symbol: "PERP_ETH_USDC",
          position_qty: 2,
          average_open_price: 4000,
        },
        {
          defaultOrder: orderWithInactiveTP,
          isEditing: true,
          positionType: PositionType.FULL,
        },
      ),
    );

    act(() => {
      result.current[1].setValues({
        tp_trigger_price: 4100,
        tp_order_type: OrderType.LIMIT,
        tp_order_price: 4110,
      });
    });

    await act(async () => {
      await result.current[1].submit();
    });

    expect(mockUpdateOrder).toHaveBeenCalledWith(
      {
        order_id: 10,
        child_orders: [
          {
            order_id: 11,
            order_type: OrderType.LIMIT,
            trigger_price: 4100,
            price: 4110,
          },
        ],
      },
      {},
      undefined,
    );
  });

  it.each([
    { slActivated: true, emptyTrigger: undefined },
    { slActivated: false, emptyTrigger: undefined },
    { slActivated: false, emptyTrigger: "" },
  ])(
    "allows a price-only edit after triggering with %j",
    async ({ slActivated, emptyTrigger }) => {
      mockMarkPrice = 2471.7;
      const triggeredLimitOrder = {
        ...existingFullOrder,
        is_triggered: true,
        child_orders: [
          {
            ...existingFullOrder.child_orders[0],
            type: OrderType.LIMIT,
            trigger_price: 2470.9,
            price: 2490,
            status: OrderStatus.NEW,
            is_triggered: false,
          },
          {
            ...existingFullOrder.child_orders[1],
            algo_status: OrderStatus.CANCELLED,
            is_activated: slActivated,
          },
        ],
      } as API.AlgoOrder;
      const { result } = renderHook(() =>
        useTaskProfitAndStopLossInternal(
          {
            symbol: "PERP_ETH_USDC",
            position_qty: 2,
            average_open_price: 4000,
          },
          {
            defaultOrder: triggeredLimitOrder,
            isEditing: true,
            positionType: PositionType.FULL,
          },
        ),
      );

      act(() => {
        result.current[1].setValues({ tp_order_price: 2485 });
        if (emptyTrigger !== undefined) {
          result.current[1].setValues({ sl_trigger_price: emptyTrigger });
        }
      });

      await act(async () => {
        await expect(result.current[1].validate()).resolves.toBeDefined();
        await result.current[1].submit();
      });

      expect(mockUpdateOrder).toHaveBeenCalledWith(
        {
          order_id: 10,
          child_orders: [{ order_id: 11, price: 2485 }],
        },
        {},
        undefined,
      );
    },
  );

  it.each([
    ["tp_offset", 200, 4110],
    ["tp_offset_percentage", 0.05, 4110],
    ["tp_offset_from_mark", 200, 4110],
    ["tp_offset_percentage_from_mark", 0.05, 4110],
    ["tp_pnl", 400, 4200],
  ])(
    "applies %s = %s to the triggered Limit leg with execution price %s",
    async (key, value, expectedPrice) => {
      const defaultOrder = {
        ...existingFullOrder,
        is_triggered: true,
        child_orders: [
          {
            ...existingFullOrder.child_orders[0],
            type: OrderType.LIMIT,
            price: 4110,
          },
          existingFullOrder.child_orders[1],
        ],
      } as API.AlgoOrder;
      const { result } = renderHook(() =>
        useTaskProfitAndStopLossInternal(
          {
            symbol: "PERP_ETH_USDC",
            position_qty: 2,
            average_open_price: 4000,
          },
          { defaultOrder, isEditing: true, positionType: PositionType.FULL },
        ),
      );

      act(() => {
        result.current[1].setValue(key as string, value);
      });

      expect(Number(result.current[0].tp_trigger_price)).toBe(4100);
      expect(Number(result.current[0].tp_order_price)).toBe(expectedPrice);
      await act(async () => {
        await expect(result.current[1].validate()).resolves.toBeDefined();
        await result.current[1].submit();
      });
      if (key === "tp_pnl") {
        expect(mockUpdateOrder).toHaveBeenCalledWith(
          {
            order_id: 10,
            child_orders: [{ order_id: 11, price: expectedPrice }],
          },
          {},
          undefined,
        );
      } else {
        expect(mockUpdateOrder).not.toHaveBeenCalled();
      }
    },
  );

  it("does not write back an untouched sibling that changed after confirmation opened", async () => {
    const original: API.AlgoOrder = {
      ...existingFullOrder,
      child_orders: [
        {
          ...existingFullOrder.child_orders[0],
          type: OrderType.LIMIT,
          price: 4130,
        },
        {
          ...existingFullOrder.child_orders[1],
          type: OrderType.LIMIT,
          price: 3890,
        },
      ],
    };
    const { result, rerender } = renderHook(
      ({ defaultOrder }) =>
        useTaskProfitAndStopLossInternal(
          {
            symbol: "PERP_ETH_USDC",
            position_qty: 2,
            average_open_price: 4000,
          },
          { defaultOrder, isEditing: true, positionType: PositionType.FULL },
        ),
      { initialProps: { defaultOrder: original } },
    );
    await act(async () => {
      result.current[1].setValue("sl_order_price", "3880");
    });
    const submitFromConfirmation = result.current[1].submit;
    rerender({
      defaultOrder: {
        ...original,
        child_orders: [
          { ...original.child_orders[0], price: 4140 },
          original.child_orders[1],
        ],
      },
    });
    await submitFromConfirmation();

    expect(mockUpdateOrder).toHaveBeenCalledWith(
      { order_id: 10, child_orders: [{ order_id: 12, price: 3880 }] },
      {},
      undefined,
    );
  });

  it("does not delete a parent when another leg activates before confirmation", async () => {
    const original: API.AlgoOrder = {
      ...existingFullOrder,
      child_orders: [
        existingFullOrder.child_orders[0],
        { ...existingFullOrder.child_orders[1], is_activated: false },
      ],
    };
    const { result, rerender } = renderHook(
      ({ defaultOrder }) =>
        useTaskProfitAndStopLossInternal(
          {
            symbol: "PERP_ETH_USDC",
            position_qty: 2,
            average_open_price: 4000,
          },
          { defaultOrder, isEditing: true, positionType: PositionType.FULL },
        ),
      { initialProps: { defaultOrder: original } },
    );
    await act(async () => {
      result.current[1].setValue("tp_trigger_price", "");
    });
    const submitFromConfirmation = result.current[1].submit;
    rerender({ defaultOrder: existingFullOrder });
    await submitFromConfirmation();

    expect(mockDeleteOrder).not.toHaveBeenCalled();
    expect(mockUpdateOrder).toHaveBeenCalledWith(
      { order_id: 10, child_orders: [{ order_id: 11, is_activated: false }] },
      {},
      undefined,
    );
  });

  it("validates equal Limit trigger and execution prices after the first SL offset", async () => {
    mockMarkPrice = 2400;
    const { result } = renderHook(() =>
      useTaskProfitAndStopLossInternal(
        { symbol: "PERP_ETH_USDC", position_qty: 2, average_open_price: 2400 },
        { isEditing: false, positionType: PositionType.FULL },
      ),
    );
    await act(async () => {
      result.current[1].setValue("sl_order_type", OrderType.LIMIT);
      result.current[1].setValue("sl_offset_percentage", 0.02);
    });
    expect(result.current[0]).toMatchObject({
      sl_trigger_price: "2352",
      sl_order_price: "2352",
    });
    await act(async () => {
      await expect(result.current[1].validate()).resolves.toBeDefined();
    });
  });

  it("ignores PnL and offset edits on a triggered Market leg", async () => {
    const defaultOrder = { ...existingFullOrder, is_triggered: true };
    const { result } = renderHook(() =>
      useTaskProfitAndStopLossInternal(
        { symbol: "PERP_ETH_USDC", position_qty: 2, average_open_price: 4000 },
        { defaultOrder, isEditing: true, positionType: PositionType.FULL },
      ),
    );
    await act(async () => {
      result.current[1].setValue("tp_offset_percentage", 0.05);
      result.current[1].setValue("tp_pnl", 400);
    });
    expect(result.current[0].tp_trigger_price).toBe(4100);
    expect(result.current[0].tp_order_price).toBeUndefined();
  });

  it.each([
    { activated: true, trigger: 3901 },
    { activated: true, trigger: "" },
    { activated: false, trigger: 3900 },
  ])(
    "rejects a trigger change after triggering with %j",
    async ({ activated, trigger }) => {
      const triggeredLimitOrder = {
        ...existingFullOrder,
        is_triggered: true,
        child_orders: [
          {
            ...existingFullOrder.child_orders[0],
            type: OrderType.LIMIT,
            trigger_price: 3900,
            price: 3950,
            is_triggered: true,
            is_activated: activated,
          },
          existingFullOrder.child_orders[1],
        ],
      } as API.AlgoOrder;
      const openOrder = {
        ...triggeredLimitOrder,
        is_triggered: false,
        child_orders: [
          { ...triggeredLimitOrder.child_orders[0], is_triggered: false },
          triggeredLimitOrder.child_orders[1],
        ],
      };
      const { result, rerender } = renderHook(
        ({ defaultOrder }) =>
          useTaskProfitAndStopLossInternal(
            {
              symbol: "PERP_ETH_USDC",
              position_qty: 2,
              average_open_price: 4000,
            },
            { defaultOrder, isEditing: true, positionType: PositionType.FULL },
          ),
        { initialProps: { defaultOrder: openOrder } },
      );

      act(() => {
        result.current[1].setValues({ tp_trigger_price: trigger }, true);
      });
      const submitFromOpenConfirmation = result.current[1].submit;
      rerender({ defaultOrder: triggeredLimitOrder as typeof openOrder });
      await expect(submitFromOpenConfirmation()).rejects.toThrow(
        /cannot be changed/,
      );

      let validationError: unknown;
      await act(async () => {
        try {
          await result.current[1].validate();
        } catch (error) {
          validationError = error;
        }
      });

      expect(validationError).toMatchObject({
        tp_trigger_price: {
          message: "Trigger price cannot be changed after TP/SL is triggered",
        },
      });
      expect(mockUpdateOrder).not.toHaveBeenCalled();
    },
  );
});
