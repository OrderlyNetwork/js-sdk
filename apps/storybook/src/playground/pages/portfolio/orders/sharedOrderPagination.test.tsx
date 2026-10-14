import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { SharedProductOrdersPanel } from "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.ui";

const mocks = vi.hoisted(() => ({
  table: {} as any,
  perpsMore: vi.fn(),
  binaryMore: vi.fn(),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({ Button: () => null }));
vi.mock("@orderly.network/ui-orders", () => ({
  DesktopOrderList: (props: any) => {
    mocks.table = props;
    return null;
  },
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.script",
  () => ({
    buildProductFilterItems: () => [],
    useSharedProductOrdersPanelScript: () => ({ instrument: "all" }),
    useAllProductOrdersTableScript: () => ({
      orderListState: {
        dataSource: Array.from({ length: 50 }, (_, order_id) => ({ order_id })),
        isValidating: false,
      },
      predictionOrders: [],
      binary: {
        hasMore: true,
        isValidating: false,
        loadMore: mocks.binaryMore,
      },
      perpsTotal: 50,
      perpsHasMore: true,
      loadMorePerps: mocks.perpsMore,
    }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionFilters.script",
  () => ({
    usePredictionFilters: () => ({}),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/useScopedPredictionAccount",
  () => ({
    useScopedPredictionAccount: (state: unknown) => state,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrdersTable.widget",
  () => ({
    PredictionOrdersTable: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrderCell.ui",
  () => ({
    PredictionOrderCell: () => null,
  }),
);

let renderer: ReactTestRenderer;
afterEach(() => {
  act(() => renderer?.unmount());
  vi.clearAllMocks();
});

it("loads the next batch after selecting 100 rows with only 50 Perps rows loaded", () => {
  act(() => {
    renderer = create(
      createElement(SharedProductOrdersPanel, {
        state: {} as any,
        mode: "history",
      }),
    );
  });
  expect(mocks.table.mergedPageSize).toBe(20);
  expect(mocks.perpsMore).not.toHaveBeenCalled();
  act(() => mocks.table.onMergedPageSizeChange(100));
  expect(mocks.table.mergedPageSize).toBe(100);
  expect(mocks.perpsMore).toHaveBeenCalledOnce();
  expect(mocks.binaryMore).toHaveBeenCalledTimes(2);
  mocks.perpsMore.mockClear();
  act(() => mocks.table.onMergedPageChange(5));
  expect(mocks.perpsMore).toHaveBeenCalledOnce();
  mocks.perpsMore.mockClear();
  act(() => mocks.table.onMergedPageSizeChange(10));
  expect(mocks.table.mergedPageSize).toBe(10);
  expect(mocks.perpsMore).not.toHaveBeenCalled();
});
