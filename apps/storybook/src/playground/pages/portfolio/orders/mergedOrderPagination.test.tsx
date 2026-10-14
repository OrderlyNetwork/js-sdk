import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { DesktopOrderList } from "@orderly.network/ui-orders/src/components/orderList/orderList.ui";

const mocks = vi.hoisted(() => ({ table: {} as any }));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  Flex: ({ children }: any) => children,
  DataTable: (props: any) => {
    mocks.table = props;
    return null;
  },
  TableFeatures: { DownloadFeature: "download" },
}));
vi.mock("@orderly.network/ui-connector", () => ({
  AuthGuardDataTable: () => null,
}));
vi.mock("@orderly.network/ui-orders/src/components/orders.widget", () => ({
  TabType: { all: "all", pending: "pending", tp_sl: "tp_sl" },
}));
vi.mock(
  "@orderly.network/ui-orders/src/components/orderList/desktop/useColumn",
  () => ({
    useOrderColumn: () => [],
    adaptColumnsForSupplementalRows: (columns: unknown) => columns,
  }),
);
vi.mock("@orderly.network/ui-orders/src/components/orderList/mobile", () => ({
  OrderCellWidget: () => null,
}));
vi.mock(
  "@orderly.network/ui-orders/src/components/orderList/orderListProvider",
  () => ({
    OrderListProvider: ({ children }: any) => children,
  }),
);
vi.mock(
  "@orderly.network/ui-orders/src/components/provider/symbolProvider",
  () => ({
    SymbolProvider: ({ children }: any) => children,
  }),
);
vi.mock(
  "@orderly.network/ui-orders/src/components/orderList/tpslOrderRowContext",
  () => ({
    TPSLOrderRowProvider: ({ children }: any) => children,
  }),
);

let renderer: ReactTestRenderer;
afterEach(() => act(() => renderer?.unmount()));
const props = {
  type: "all",
  filterItems: [],
  dataSource: [],
  tableInstance: { current: undefined },
  useClientTable: true,
} as any;

it.each([
  { mergeProducts: true, supplementalRows: [] },
  {
    supplementalRows: [
      { id: "prediction-1", timestamp: 1, renderCell: () => null },
    ],
  },
])(
  "updates merged pagination for empty and populated Prediction lists",
  (mergedProps) => {
    const onMergedPageChange = vi.fn();
    const onMergedPageSizeChange = vi.fn();
    act(() => {
      renderer = create(
        createElement(DesktopOrderList, {
          ...props,
          ...mergedProps,
          onMergedPageChange,
          onMergedPageSizeChange,
        }),
      );
    });
    expect(mocks.table.pagination.pageSize).toBe(20);
    for (const size of [10, 20, 50, 100]) {
      act(() => mocks.table.pagination.onPageChange(3));
      act(() => mocks.table.pagination.onPageSizeChange(size));
      expect(mocks.table.pagination.pageSize).toBe(size);
      expect(mocks.table.pagination.page).toBe(1);
      expect(onMergedPageSizeChange).toHaveBeenLastCalledWith(size);
      expect(onMergedPageChange).toHaveBeenLastCalledWith(1);
      expect(mocks.table.manualPagination).toBe(false);
    }
  },
);

it("preserves Perps-only pagination", () => {
  const pagination = { page: 2, pageSize: 50, onPageSizeChange: vi.fn() };
  act(() => {
    renderer = create(
      createElement(DesktopOrderList, {
        ...props,
        supplementalRows: [],
        pagination,
        manualPagination: true,
      }),
    );
  });
  expect(mocks.table.pagination).toBe(pagination);
  expect(mocks.table.manualPagination).toBe(true);
});
