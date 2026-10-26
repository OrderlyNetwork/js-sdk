import React, { Children, isValidElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PredictionAccountPanel } from "@orderly.network/prediction/src/prediction/dataPanels/predictionAccountPanel.widget";
import {
  usePredictionIntegration,
  type PredictionIntegrationOptions,
} from "@orderly.network/trading/src/hooks/usePredictionIntegration";
import { AccountStatusEnum } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  mobile: false,
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
  i18n: { t: (key: string) => key },
}));
vi.mock("@orderly.network/react-app", () => ({
  useFeatureEnabled: () => true,
  useDataTap: (value: unknown) => value,
}));
vi.mock("@orderly.network/ui-connector", () => ({
  useAuthGuard: () => true,
  AuthGuardEmpty: () => null,
}));
vi.mock("@orderly.network/ui", () => ({
  useScreen: () => ({ isMobile: mocks.mobile }),
  Box: ({ children }: any) => children,
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
vi.mock("@orderly.network/ui-positions", async () => {
  const { PositionSymbolCell } = await vi.importActual<
    typeof import("@orderly.network/ui-positions/src/components/positions/desktop/positionSymbolCell")
  >(
    "@orderly.network/ui-positions/src/components/positions/desktop/positionSymbolCell",
  );
  return {
    PositionHistoryWidget: (props: any) => {
      mocks.history(props);
      return null;
    },
    MobilePositionHistoryWidget: (props: any) => {
      mocks.history(props);
      return null;
    },
    MobilePositionsWidget: (props: any) => (
      <PositionSymbolCell
        symbol="PERP_ETH_USDC"
        onSymbolChange={props.onSymbolChange}
      />
    ),
  };
});
vi.mock("@orderly.network/trading-shared", async () => {
  const { PositionSymbolCell } = await vi.importActual<
    typeof import("@orderly.network/ui-positions/src/components/positions/desktop/positionSymbolCell")
  >(
    "@orderly.network/ui-positions/src/components/positions/desktop/positionSymbolCell",
  );
  return {
    PerpsPositionsSettings: () => null,
    PerpsPositionsPanel: (props: any) => (
      <PositionSymbolCell
        symbol="PERP_ETH_USDC"
        onSymbolChange={props.onSymbolChange}
      />
    ),
  };
});
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
function Consumer(props: PredictionIntegrationOptions) {
  const content = usePredictionIntegration(props).dataListProductContent;
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
const host: PredictionIntegrationOptions = {
  symbol: "PERP_BTC_USDC",
  showAllSymbol: false,
  onPredictionSelect: vi.fn(),
  onSymbolChange: vi.fn(),
  sharePnLConfig: { backgroundImages: ["https://example.com/pnl.png"] },
  pnlNotionalDecimalPrecision: 4,
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.mobile = false;
});
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

it.each([false, true])(
  "Prediction account positions forward Perp symbol clicks on mobile=%s",
  (mobile) => {
    mocks.mobile = mobile;
    const onSymbolChange = vi.fn();
    const onSelectRoundSymbol = vi.fn();
    const props = {
      activeTab: "predictions" as const,
      setActiveTab: vi.fn(),
      isSubmitting: false,
      isRegionRestricted: false,
      onSelectRoundSymbol,
      onSymbolChange,
    };
    act(() => {
      root = create(<PredictionAccountPanel {...props} />);
    });
    const perpsTab = root!.root
      .findAllByProps({ role: "tab" })
      .find((tab) => tab.children.join("").includes("common.perps"))!;
    act(() => perpsTab.props.onClick());
    const clickSymbol = () =>
      root!.root.findByProps({ "data-testid": "native-symbol" }).props.onClick({
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      });
    act(clickSymbol);
    expect(onSymbolChange).toHaveBeenCalledExactlyOnceWith({
      symbol: "PERP_ETH_USDC",
    });
    expect(onSelectRoundSymbol).not.toHaveBeenCalled();
    const nextHandler = vi.fn();
    act(() =>
      root!.update(
        <PredictionAccountPanel {...props} onSymbolChange={nextHandler} />,
      ),
    );
    act(clickSymbol);
    expect(nextHandler).toHaveBeenCalledExactlyOnceWith({
      symbol: "PERP_ETH_USDC",
    });
    expect(onSymbolChange).toHaveBeenCalledOnce();
  },
);

vi.mock("@orderly.network/prediction", async () => ({
  usePredictionAccountData: (
    await import("@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData")
  ).usePredictionAccountData,
  useSharedProductCounts: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/useSharedProductCounts")
  ).useSharedProductCounts,
  usePredictionMarketsDropdown: (
    await import("@orderly.network/prediction/src/prediction/usePredictionMarketsDropdown")
  ).usePredictionMarketsDropdown,
  usePredictionMarketTabs: (
    await import("@orderly.network/prediction/src/prediction/predictionMarketPanel.ui")
  ).usePredictionMarketTabs,
  SharedProductDataPanel: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/sharedProductDataPanel.ui")
  ).SharedProductDataPanel,
  SharedProductOrdersPanel: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.ui")
  ).SharedProductOrdersPanel,
  MobileSharedProductOrdersPanel: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.mobile.ui")
  ).MobileSharedProductOrdersPanel,
  MobileSharedProductHistory: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/sharedProductHistory.mobile.ui")
  ).MobileSharedProductHistory,
}));
