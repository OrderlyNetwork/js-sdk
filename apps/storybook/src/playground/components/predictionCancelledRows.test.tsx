import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { SharedProductOrdersPanel } from "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.ui";
import { OrderStatus } from "@orderly.network/types";
import { DesktopOrderList } from "@orderly.network/ui-orders/src/components/orderList/orderList.ui";

const mocks = vi.hoisted(() => ({ orders: [] as any[], table: null as any }));
vi.mock("@orderly.network/i18n", () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/hooks", () => ({ utils: {} }));
vi.mock("@orderly.network/ui", () => {
  const wrapper = ({ children }: any) => <div>{children}</div>;
  return {
    Flex: wrapper,
    TableFeatures: { DownloadFeature: "download" },
    Button: wrapper,
    Badge: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Text: { numeral: wrapper, formatted: wrapper },
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
    DataTable: (props: any) => {
      mocks.table = props;
      return (
        <>
          {props.dataSource.map((row: any) => (
            <div
              key={row.order_id}
              data-row={row.order_id}
              {...props.onRow(row)}
            >
              {props.columns.map((column: any) => (
                <div key={column.dataIndex} data-cell={column.dataIndex}>
                  {column.render(undefined, row)}
                </div>
              ))}
            </div>
          ))}
        </>
      );
    },
  };
});
vi.mock("@orderly.network/ui-connector", () => ({
  AuthGuardDataTable: () => null,
}));
vi.mock("@orderly.network/ui-orders", async () => ({
  DesktopOrderList: (
    await import("@orderly.network/ui-orders/src/components/orderList/orderList.ui")
  ).DesktopOrderList,
  EditableCellInput: () => null,
  OrderEditConfirmation: () => null,
}));
vi.mock("@orderly.network/ui-orders/src/components/orders.widget", () => ({
  TabType: { pending: "pending", tp_sl: "tp_sl", orderHistory: "orderHistory" },
}));
vi.mock(
  "@orderly.network/ui-orders/src/components/orderList/desktop/useColumn",
  () => ({
    useOrderColumn: () =>
      ["symbol", "side", "fill_quantity", "price", "status"].map(
        (dataIndex) => ({ dataIndex }),
      ),
    adaptColumnsForSupplementalRows: (columns: any) => columns,
  }),
);
vi.mock("@orderly.network/ui-orders/src/components/orderList/mobile", () => ({
  OrderCellWidget: () => null,
}));
vi.mock(
  "@orderly.network/ui-orders/src/components/orderList/orderListProvider",
  () => ({ OrderListProvider: ({ children }: any) => children }),
);
vi.mock("@orderly.network/prediction/src/prediction/predictionShared", () => ({
  usePredictionFormatters: () => ({ formatRoundBadge: () => "11:00" }),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionFilters.script",
  () => ({
    usePredictionFilters: () => ({}),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/orders/matchesPredictionOrderFilters",
  () => ({
    matchesPredictionOrderFilters: () => true,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrdersTable.widget",
  () => ({ PredictionOrdersTable: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.script",
  () => ({
    buildProductFilterItems: () => [],
    useSharedProductOrdersPanelScript: () => ({ instrument: "all" }),
    useAllProductOrdersTableScript: () => ({
      orderListState: {
        type: "orderHistory",
        filterItems: [],
        useClientTable: true,
        dataSource: [],
      },
      predictionOrders: mocks.orders,
      binary: { hasMore: false },
      perpsHasMore: false,
      perpsTotal: 0,
    }),
  }),
);

let renderer: ReactTestRenderer;
afterEach(() => {
  act(() => renderer?.unmount());
});

it.each([0, 2])(
  "dims cancelled Prediction rows including %s filled quantity",
  (filledQuantity) => {
    mocks.orders = [
      {
        id: 1,
        timestamp: 1,
        symbol: "PERP_BTC5M2701011200_USDC",
        round: 0,
        status: "cancelled",
        outcome: "down",
        side: "sell",
        type: "limit",
        price: 0.5,
        quantity: 10,
        filledQuantity,
        reduceOnly: true,
      },
    ];
    act(() => {
      renderer = create(
        <SharedProductOrdersPanel state={{} as any} mode="history" />,
      );
    });
    expect(mocks.table.dataSource[0].status).toBe(OrderStatus.CANCELLED);
    const row = renderer.root.findByProps({ "data-row": "prediction-1" });
    expect(row.props.className).toContain("oui-text-base-contrast-20");
    const symbol = row.findByProps({ "data-cell": "symbol" });
    expect(
      symbol
        .findAllByType("div")
        .some(
          (node) =>
            node.props.className === "oui-min-w-0 oui-text-base-contrast-20",
        ),
    ).toBe(true);
    const side = row.findByProps({ "data-cell": "side" });
    expect(side.findByProps({ color: "neutral" }).props.className).toContain(
      "oui-text-base-contrast-20",
    );
    expect(
      side
        .findAllByType("span")
        .some(
          (node) =>
            node.props.className === "oui-text-3xs oui-text-base-contrast-20",
        ),
    ).toBe(true);
  },
);

it("uses the same cancelled row styling for Perps and supplemental orders, preserving other states", () => {
  act(() => {
    renderer = create(
      <DesktopOrderList
        {...({
          type: "orderHistory",
          filterItems: [],
          useClientTable: true,
          dataSource: [{ order_id: 1, status: OrderStatus.CANCELLED }],
          supplementalRows: [
            OrderStatus.CANCELLED,
            OrderStatus.FILLED,
            OrderStatus.REJECTED,
            undefined,
          ].map((status, index) => ({
            id: `prediction-${index}`,
            timestamp: index,
            status,
            renderCell: () => null,
          })),
        } as any)}
      />,
    );
  });
  for (const row of mocks.table.dataSource) {
    expect(mocks.table.onRow(row).className).toContain(
      row.status === OrderStatus.CANCELLED
        ? "oui-text-base-contrast-20"
        : "oui-text-base-contrast-80",
    );
  }
});

it.each(["filled", "rejected"])("keeps %s Prediction rows bright", (status) => {
  mocks.orders = [
    {
      id: 2,
      timestamp: 2,
      symbol: "PERP_BTC5M2701011200_USDC",
      round: 0,
      status,
      outcome: "up",
      side: "buy",
      type: "limit",
      price: 0.5,
      quantity: 10,
      filledQuantity: 2,
    },
  ];
  act(() => {
    renderer = create(
      <SharedProductOrdersPanel state={{} as any} mode="history" />,
    );
  });
  const row = renderer.root.findByProps({ "data-row": "prediction-2" });
  expect(row.props.className).toContain("oui-text-base-contrast-80");
  expect(
    row.findByProps({ "data-cell": "side" }).findByProps({ color: "buy" }).props
      .className,
  ).not.toContain("oui-text-base-contrast-20");
  expect(
    row
      .findByProps({ "data-cell": "symbol" })
      .findAllByType("div")
      .some(
        (node) => node.props.className === "oui-min-w-0 oui-text-base-contrast",
      ),
  ).toBe(true);
});
