import { act, renderHook } from "@testing-library/react";
import {
  AlgoOrderRootType,
  API,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import { createMockSymbolConfig } from "../../../services/orderCreator/__test__/testHelpers";
import { useTaskProfitAndStopLossInternal } from "../useTPSL";

const mockCreateOrder = jest.fn().mockResolvedValue({ success: true });
const mockUpdateOrder = jest.fn().mockResolvedValue({ success: true });
const mockDeleteOrder = jest.fn().mockResolvedValue({ success: true });
let mockSymbolInfo = createMockSymbolConfig();

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
  useMarkPrice: () => ({ data: 4000 }),
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
});
