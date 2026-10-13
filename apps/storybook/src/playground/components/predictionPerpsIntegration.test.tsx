import React, { Children, isValidElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  usePredictionTradingExtension,
  type PredictionTradingExtensionOptions,
} from "@orderly.network/prediction/src/prediction/usePredictionTradingExtension";
import { AccountStatusEnum } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  orders: vi.fn(),
  history: vi.fn(),
  state: {
    positions: [],
    openOrders: [],
    history: [],
    settlements: [],
    historyRecords: [],
  },
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData",
  () => ({
    usePredictionAccountData: () => mocks.state,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/useSharedProductCounts",
  () => ({
    useSharedProductCounts: () => ({ positions: 0, pending: 0 }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/usePredictionMarketsDropdown",
  () => ({
    usePredictionMarketsDropdown: () => ({}),
  }),
);
vi.mock("@orderly.network/hooks", () => ({
  useAccount: () => ({
    state: { status: AccountStatusEnum.EnableTrading },
  }),
  usePositionStream: () => [{ rows: [] }],
  useOrderStream: () => [[], { meta: { total: 0 }, loadMore: vi.fn() }],
  useBadgeBySymbol: () => ({}),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/react-app", () => ({
  useDataTap: (value: unknown) => value,
}));
vi.mock("@orderly.network/ui-connector", () => ({
  useAuthGuard: () => true,
  AuthGuardEmpty: () => null,
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...classes: string[]) => classes.join(" "),
  Button: () => null,
  EmptyDataState: () => null,
  Text: {
    symbolBadge: ({ onClick, children }: any) => (
      <button data-testid="native-symbol" onClick={onClick}>
        {children}
      </button>
    ),
  },
  TabPanel: ({ children }: any) => children,
  Tabs: ({ value, onValueChange, children }: any) => (
    <>
      <button
        data-testid="history-orders"
        onClick={() => onValueChange("orders")}
      >
        Orders
      </button>
      {Children.toArray(children).filter(
        (child) => isValidElement(child) && child.props.value === value,
      )}
    </>
  ),
}));
vi.mock("@orderly.network/ui-orders", async () => {
  const { OrderSymbolCell } = await vi.importActual<
    typeof import("@orderly.network/ui-orders/src/components/orderList/desktop/orderSymbolCell")
  >(
    "@orderly.network/ui-orders/src/components/orderList/desktop/orderSymbolCell",
  );
  const Orders = (props: any) => {
    mocks.orders(props);
    return (
      <OrderSymbolCell
        symbol="PERP_ETH_USDC"
        onSymbolChange={props.onSymbolChange}
      />
    );
  };
  return {
    TabType: { pending: "pending", filled: "filled", orderHistory: "history" },
    useOrderListScript: (props: any) => ({
      ...props,
      dataSource: [],
      onFilter: vi.fn(),
      loadMore: vi.fn(),
    }),
    DesktopOrderList: Orders,
    MobileOrderList: Orders,
  };
});
vi.mock("@orderly.network/ui-positions", () => ({
  PositionHistoryWidget: (props: any) => {
    mocks.history(props);
    return null;
  },
  MobilePositionHistoryWidget: (props: any) => {
    mocks.history(props);
    return null;
  },
  MobilePositionsWidget: () => null,
}));
vi.mock("@orderly.network/trading-shared", () => ({
  PerpsPositionsPanel: () => null,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/useProductOrderCancelAll",
  () => ({
    useProductOrderCancelAll: () => ({ orderListProps: {} }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrdersTable.widget",
  () => ({ PredictionOrdersTable: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrderCell.ui",
  () => ({ PredictionOrderCell: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/holdings/holdingsTable.widget",
  () => ({ HoldingsTable: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/history/predictionHistoryTable.widget",
  () => ({ PredictionHistoryTable: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/predictionMobileCards.ui",
  () => ({
    MobilePredictionOrderCard: () => null,
    MobilePredictionHistory: () => null,
    MobilePredictionPositions: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/filters/predictionFilters.ui",
  () => ({ PredictionFilters: () => null }),
);

let root: ReactTestRenderer | undefined;
function Consumer(props: PredictionTradingExtensionOptions) {
  const content = usePredictionTradingExtension(props).dataListProductContent;
  return (
    <>
      {content?.pending}
      {content?.filled}
      {content?.orderHistory}
      {content?.positionHistory}
      {content?.mobile?.pending}
      {content?.mobile?.history}
    </>
  );
}
const host: PredictionTradingExtensionOptions = {
  symbol: "PERP_BTC_USDC",
  showAllSymbol: false,
  onPredictionSelect: vi.fn(),
  onSymbolChange: vi.fn(),
  sharePnLConfig: { backgroundImages: ["https://example.com/pnl.png"] },
  pnlNotionalDecimalPrecision: 4,
};
beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it("keeps host navigation, sharing and precision through actual desktop/mobile shared panels", () => {
  act(() => {
    root = create(<Consumer {...host} />);
  });
  expect(mocks.orders).toHaveBeenCalledTimes(4);
  expect(mocks.history).toHaveBeenCalledTimes(2);
  for (const spy of [mocks.orders, mocks.history]) {
    for (const [props] of spy.mock.calls) {
      expect(props.onSymbolChange).toBe(host.onSymbolChange);
      expect(props.sharePnLConfig).toBe(host.sharePnLConfig);
      expect(props.pnlNotionalDecimalPrecision).toBe(4);
      expect(props.symbol).toBe("PERP_BTC_USDC");
    }
  }
  const symbols = root!.root.findAllByProps({ "data-testid": "native-symbol" });
  expect(symbols).toHaveLength(4);
  for (const symbol of symbols) {
    act(() =>
      symbol.props.onClick({
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      }),
    );
  }
  expect(host.onSymbolChange).toHaveBeenCalledTimes(4);
  expect(host.onSymbolChange).toHaveBeenLastCalledWith({
    symbol: "PERP_ETH_USDC",
  });
  act(() =>
    root!.root.findByProps({ "data-testid": "history-orders" }).props.onClick(),
  );
  const mobileHistory = mocks.orders.mock.calls.at(-1)![0];
  expect(mobileHistory.type).toBe("history");
  expect(mobileHistory.onSymbolChange).toBe(host.onSymbolChange);
  expect(mobileHistory.sharePnLConfig).toBe(host.sharePnLConfig);
  expect(mobileHistory.pnlNotionalDecimalPrecision).toBe(4);
});

it("updates mounted native panels with new host callbacks and settings", () => {
  act(() => {
    root = create(<Consumer {...host} />);
  });
  const next = {
    ...host,
    onSymbolChange: vi.fn(),
    pnlNotionalDecimalPrecision: 6,
    sharePnLConfig: {},
  };
  mocks.orders.mockClear();
  mocks.history.mockClear();
  act(() => root!.update(<Consumer {...next} />));
  for (const spy of [mocks.orders, mocks.history]) {
    for (const [props] of spy.mock.calls) {
      expect(props.onSymbolChange).toBe(next.onSymbolChange);
      expect(props.sharePnLConfig).toBe(next.sharePnLConfig);
      expect(props.pnlNotionalDecimalPrecision).toBe(6);
    }
  }
  const symbol = root!.root.findAllByProps({
    "data-testid": "native-symbol",
  })[0];
  act(() =>
    symbol.props.onClick({ stopPropagation: vi.fn(), preventDefault: vi.fn() }),
  );
  expect(next.onSymbolChange).toHaveBeenCalledWith({ symbol: "PERP_ETH_USDC" });
  expect(host.onSymbolChange).not.toHaveBeenCalled();
});
