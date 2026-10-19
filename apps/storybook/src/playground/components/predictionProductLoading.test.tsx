import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type {
  PredictionAccountPanelState,
  ProductOrderInstrument,
} from "@orderly.network/prediction";
import { useAllProductOrdersTableScript } from "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.script";

const mocks = vi.hoisted(() => ({
  perps: vi.fn(),
  binary: vi.fn(),
  loadMore: vi.fn(),
}));
vi.mock("@orderly.network/ui-orders", () => ({
  TabType: { pending: "pending", filled: "filled", orderHistory: "history" },
  useOrderListScript: (options: unknown) => {
    mocks.perps(options);
    return {
      dataSource: [],
      orderStatus: undefined,
      ordersSide: undefined,
      isLoading: false,
      isValidating: false,
      loadMore: mocks.loadMore,
    };
  },
}));
vi.mock("@orderly.network/hooks", () => ({
  useOrderStream: (params: unknown, options: unknown) => {
    mocks.binary(params, options);
    return [
      [
        {
          order_id: 1,
          symbol: "PERP_BTC5M2610081200_USDC",
          side: "BUY",
          status: "REJECTED",
          price: 0.5,
          quantity: 10,
        },
      ],
      {
        meta: { total: 100 },
        isLoading: false,
        isValidating: false,
        loadMore: mocks.loadMore,
      },
    ];
  },
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/useProductOrderCancelAll",
  () => ({ useProductOrderCancelAll: () => ({ orderListProps: {} }) }),
);
let root: ReactTestRenderer | undefined;
let result: ReturnType<typeof useAllProductOrdersTableScript>;
function Consumer({ instrument }: { instrument: ProductOrderInstrument }) {
  result = useAllProductOrdersTableScript({
    state: {} as PredictionAccountPanelState,
    mode: "history",
    mobile: true,
    instrument,
    includePrediction: instrument !== "perps",
  });
  return null;
}
beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
it("activates only the selected product, hides disabled cached rows, and keeps display pagination manual", () => {
  act(() => {
    root = create(<Consumer instrument="perps" />);
  });
  expect(mocks.perps.mock.calls.at(-1)?.[0].enabled).toBe(true);
  expect(mocks.binary.mock.calls.at(-1)?.[1].enabled).toBe(false);
  expect(result.predictionOrders).toEqual([]);
  expect(result.binary.hasMore).toBe(false);
  act(() => root!.update(<Consumer instrument="prediction" />));
  expect(mocks.perps.mock.calls.at(-1)?.[0].enabled).toBe(false);
  expect(mocks.binary.mock.calls.at(-1)?.[1].enabled).toBe(true);
  expect(result.predictionOrders[0].status).toBe("REJECTED");
  expect(result.binary.hasMore).toBe(true);
  expect(mocks.loadMore).not.toHaveBeenCalled();
  act(() => root!.update(<Consumer instrument="all" />));
  expect(mocks.perps.mock.calls.at(-1)?.[0].enabled).toBe(true);
  expect(mocks.binary.mock.calls.at(-1)?.[1].enabled).toBe(true);
  expect(mocks.binary.mock.calls.at(-1)?.[0].size).toBe(50);
});
