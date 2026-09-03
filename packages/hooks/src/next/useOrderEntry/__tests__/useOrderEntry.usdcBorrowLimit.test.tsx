import { act, renderHook } from "@testing-library/react-hooks";
import { MarginMode, OrderSide, OrderType } from "@orderly.network/types";
import { USDCBorrowLimitExceededError } from "../usdcBorrowLimit";
import { useOrderEntry } from "../useOrderEntry";

const mockSymbol = "PERP_BTC_USDC";
const mockGeneratedOrder = {
  symbol: mockSymbol,
  side: OrderSide.BUY,
  order_type: OrderType.LIMIT,
  order_price: "100",
  order_quantity: "1",
  reduce_only: false,
  margin_mode: MarginMode.ISOLATED,
};
const mockFormattedOrder = {
  ...mockGeneratedOrder,
  order_quantity: "0",
};

const mockCreateOrder = jest.fn();
const mockValidate = jest.fn();
const mockGenerateOrder = jest.fn();
let mockOrderbookUpdate: ((data: unknown) => void) | undefined;
const mockPositionRows: Array<{
  symbol: string;
  margin_mode: MarginMode;
  position_qty: number;
  pending_long_qty: number;
  pending_short_qty: number;
  leverage: number;
}> = [];
const mockPortfolio = {
  holding: [
    {
      token: "USDC",
      holding: 100,
      frozen: 0,
      pending_short: 0,
      isolated_margin: 0,
      isolated_order_frozen: 0,
      updated_time: 0,
    },
  ],
  unsettledPnL: 0,
};

jest.mock("../../../orderly/appStore", () => ({
  useAccountInfo: () => undefined,
  useAppStore: {
    getState: () => ({ portfolio: mockPortfolio }),
  },
}));

jest.mock("../../../orderly/orderlyHooks", () => ({
  useCollateral: () => ({ freeCollateral: 0, totalCollateral: 0 }),
  useFundingRatesStore: () => ({}),
  useMaxQty: () => 10,
  useSymbolLeverageMap: () => ({
    getSymbolLeverage: () => 10,
    refresh: jest.fn(),
  }),
  useSymbolsInfo: () => ({
    [mockSymbol]: () => ({
      symbol: mockSymbol,
      base_dp: 4,
      quote_dp: 2,
      base_tick: 0.0001,
    }),
  }),
}));

jest.mock("../../../orderly/useMarkPrice/useMarkPriceStore", () => ({
  useMarkPriceActions: () => ({ getMarkPriceBySymbol: () => 100 }),
}));

jest.mock("../../../orderly/usePositionStream/usePosition.store", () => ({
  usePositions: () => mockPositionRows,
  usePositionStore: {
    getState: () => ({ positions: { all: { rows: mockPositionRows } } }),
  },
}));

jest.mock("../../../orderlyContext", () => ({
  useOrderlyContext: () => ({ orderMetadata: undefined }),
}));

jest.mock("../../../provider/store/symbolStore", () => ({
  useSymbolStore: (selector: (state: { fetchData: jest.Mock }) => unknown) =>
    selector({ fetchData: jest.fn() }),
}));

jest.mock("../../../useConfig", () => ({ useConfig: () => "" }));
jest.mock("../../../useEventEmitter", () => ({
  useEventEmitter: () => ({
    on: jest.fn((event: string, callback: (data: unknown) => void) => {
      if (event === "orderbook:update") {
        mockOrderbookUpdate = callback;
      }
    }),
    off: jest.fn(),
  }),
}));
jest.mock("../../../useMutation", () => ({
  useMutation: () => [mockCreateOrder, { isMutating: false }],
}));
jest.mock("../../../useTrack", () => ({
  useTrack: () => ({ track: jest.fn() }),
}));
jest.mock("../../../utils/order/orderPrice", () => ({
  ...jest.requireActual("../../../utils/order/orderPrice"),
  getOrderReferencePriceFromOrder: () => 100,
}));
jest.mock("../useOrderEntry.internal", () => ({
  useOrderEntryNextInternal: () => ({
    formattedOrder: mockFormattedOrder,
    setValue: jest.fn(),
    setValues: jest.fn(),
    setValuesRaw: jest.fn(),
    validate: mockValidate,
    generateOrder: mockGenerateOrder,
    reset: jest.fn(),
    onMarkPriceChange: jest.fn(),
  }),
}));
jest.mock("../useRwaLeverageSync", () => ({
  useRwaLeverageSync: jest.fn(),
}));
jest.mock("use-debounce", () => ({
  useDebouncedCallback: (callback: (data: unknown) => void) => callback,
}));

describe("useOrderEntry USDC borrow limit submission guard", () => {
  beforeEach(() => {
    mockCreateOrder.mockReset();
    mockValidate.mockReset().mockResolvedValue({});
    mockGenerateOrder.mockReset().mockReturnValue(mockGeneratedOrder);
    mockPortfolio.holding[0].holding = 100;
    mockPortfolio.unsettledPnL = 0;
    mockPositionRows.splice(0);
    mockOrderbookUpdate = undefined;
  });

  const publishOrderbook = () => {
    act(() => {
      mockOrderbookUpdate?.({
        asks: [[100, 10]],
        bids: [[99, 10]],
      });
    });
  };

  it("rechecks current portfolio state and blocks mutation when the limit is exceeded", async () => {
    const { result } = renderHook(() =>
      useOrderEntry(mockSymbol, {
        initialOrder: { margin_mode: MarginMode.ISOLATED },
      }),
    );
    publishOrderbook();

    expect(
      result.current.helper.getProjectedUSDCBorrow(mockGeneratedOrder),
    ).toBe(0);

    mockPortfolio.holding[0].holding = -50_000;

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.submit({ usdcBorrowLimit: 50_000 });
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toBeInstanceOf(USDCBorrowLimitExceededError);
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("preserves the mutation parameters and result when under the limit", async () => {
    type SubmitResult = {
      success: boolean;
      data: Record<string, any>;
      timestamp: number;
    };
    const response: SubmitResult = {
      success: true,
      data: { order_id: 1 },
      timestamp: 1,
    };
    mockCreateOrder.mockResolvedValue(response);
    const { result } = renderHook(() =>
      useOrderEntry(mockSymbol, {
        initialOrder: { margin_mode: MarginMode.ISOLATED },
      }),
    );
    publishOrderbook();

    let submitResult: SubmitResult | undefined;
    await act(async () => {
      submitResult = await result.current.submit({
        resetOnSuccess: false,
        usdcBorrowLimit: 50_000,
      });
    });

    expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    expect(mockCreateOrder).toHaveBeenCalledWith(mockGeneratedOrder);
    expect(submitResult).toBe(response);
  });

  it("matches the current position by both symbol and margin mode", () => {
    mockPortfolio.holding[0].holding = -49_990;
    mockPositionRows.push(
      {
        symbol: mockSymbol,
        margin_mode: MarginMode.CROSS,
        position_qty: -10,
        pending_long_qty: 0,
        pending_short_qty: 0,
        leverage: 10,
      },
      {
        symbol: mockSymbol,
        margin_mode: MarginMode.ISOLATED,
        position_qty: 0,
        pending_long_qty: 0,
        pending_short_qty: 0,
        leverage: 10,
      },
    );
    const { result } = renderHook(() =>
      useOrderEntry(mockSymbol, {
        initialOrder: { margin_mode: MarginMode.ISOLATED },
      }),
    );
    publishOrderbook();

    expect(
      result.current.helper.getProjectedUSDCBorrow(mockGeneratedOrder),
    ).toBeCloseTo(50_000.06, 8);
  });
});
