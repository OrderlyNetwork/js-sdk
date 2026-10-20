import { createElement } from "react";
import type {
  ConfigProviderProps,
  OrderlyConfigContextState,
} from "@orderly.network/hooks";
import {
  MarketsHomePage,
  type MarketsHomePageProps,
} from "@orderly.network/markets";
// Asset extraction keeps the public Portfolio and Trading wrappers compatible.
import {
  AssetsModule,
  OrdersModule,
  PositionsModule,
} from "@orderly.network/portfolio";
import {
  PredictionPage,
  useBinaryOrderRows,
  type PredictionSymbolSelection,
} from "@orderly.network/prediction";
import {
  usePredictionAccountData,
  usePredictionMarkets,
  usePredictionMarketsDropdown,
  type PredictionPerpsPanelProps,
  useSharedProductCounts,
  useProductOrderCancelAll,
  toPredictionOrderStatus,
  toApiPredictionOrderStatus,
  type PredictionAccountState,
  type PredictionAccountActions,
  type PredictionAccountPanelProps,
  type PredictionMarketsState,
  type UsePredictionAccountDataOptions,
  type SharedProductCountsState,
  type ProductOrderCancelAllState,
  type SharedProductDataPanelProps,
  type SharedProductOrdersPanelProps,
  type MobileSharedProductHistoryProps,
  type PredictionOrdersTableProps,
  type PredictionOrderCellProps,
} from "@orderly.network/prediction";
// @ts-expect-error Manual page composition is no longer a public API.
import type { usePredictionTradingExtension } from "@orderly.network/prediction";
// @ts-expect-error Manual page composition is no longer a public API.
import type { PredictionTradingExtensionOptions } from "@orderly.network/prediction";
// @ts-expect-error Manual page composition is no longer a public API.
import type { PredictionTradingExtensionProps } from "@orderly.network/prediction";
import {
  OrderlyAppProvider,
  useFeatureEnabled,
  type OrderlyAppProviderProps,
} from "@orderly.network/react-app";
import {
  TradingPage,
  TradingPageProvider,
  type TradingPageProps,
  type TradingPerpsPanelProps,
} from "@orderly.network/trading";
import {
  AssetViewWidget as TradingAssetViewWidget,
  useFirstTimeDeposit as tradingFirstDeposit,
} from "@orderly.network/trading";
// @ts-expect-error Manual page composition is no longer a public API.
import type { TradingMarketsDropdownProps as RemovedTradingTradingMarketsDropdownProps } from "@orderly.network/trading";
// @ts-expect-error Manual page composition is no longer a public API.
import type { TradingDataListProductContent as RemovedTradingTradingDataListProductContent } from "@orderly.network/trading";
// @ts-expect-error Manual page composition is no longer a public API.
import type { TradingPageExtensionProps as RemovedTradingTradingPageExtensionProps } from "@orderly.network/trading";
import {
  TradingPageProvider as NextTradingPageProvider,
  type TradingPageProps as NextTradingPageProps,
} from "@orderly.network/trading-next";
import type { TradingPerpsPanelProps as CommonPerpsPanelProps } from "@orderly.network/trading-shared";
import type { TradingPageProps as SharedTradingPageProps } from "@orderly.network/trading-shared";
// @ts-expect-error Manual page composition is no longer a public API.
import type { TradingMarketsDropdownProps as RemovedSharedTradingMarketsDropdownProps } from "@orderly.network/trading-shared";
// @ts-expect-error Manual page composition is no longer a public API.
import type { TradingDataListProductContent as RemovedSharedTradingDataListProductContent } from "@orderly.network/trading-shared";
// @ts-expect-error Manual page composition is no longer a public API.
import type { TradingPageExtensionProps as RemovedSharedTradingPageExtensionProps } from "@orderly.network/trading-shared";
import type { AppFeatures } from "@orderly.network/types";
import type { API } from "@orderly.network/types";
import {
  AssetsWidget,
  AssetsTabWidget,
  AssetViewWidget,
  useFirstTimeDeposit,
} from "@orderly.network/ui-assets";

type Assert<T extends true> = T;
type Compatible<A, B> = [A, B] extends [B, A] ? true : false;
export type SharedTradingContracts = [
  Assert<Compatible<PredictionAccountState["openOrders"][number], API.Order>>,
  Assert<Compatible<PredictionAccountState["history"][number], API.Order>>,
  Assert<Compatible<PredictionOrderCellProps["order"], API.Order>>,
  Assert<
    Compatible<ReturnType<typeof useBinaryOrderRows>["rows"][number], API.Order>
  >,
  Assert<Compatible<TradingPerpsPanelProps, CommonPerpsPanelProps>>,
  Assert<Compatible<PredictionPerpsPanelProps, TradingPerpsPanelProps>>,
  Assert<
    Compatible<
      TradingPerpsPanelProps,
      Pick<TradingPageProps, "onSymbolChange" | "sharePnLConfig"> & {
        pnlNotionalDecimalPrecision?: number;
      }
    >
  >,
  Assert<
    "pnlNotionalDecimalPrecision" extends keyof TradingPageProps ? false : true
  >,
];

/** Compile against built public declarations, with no source-path imports. */
export function usePredictionPublicApiContract(
  options: UsePredictionAccountDataOptions = {},
) {
  const account: PredictionAccountState = usePredictionAccountData(options);
  const actions: PredictionAccountActions = account;
  const accountPanel: PredictionAccountPanelProps = {
    activeTab: "predictions",
    setActiveTab: () => {},
    isSubmitting: false,
    isRegionRestricted: false,
  };
  const markets: PredictionMarketsState = usePredictionMarkets({
    enabled: options.enabled,
  });
  const counts: SharedProductCountsState = useSharedProductCounts({
    product: "all",
  });
  const cancellation: ProductOrderCancelAllState = useProductOrderCancelAll({
    binary: account,
    instrument: "prediction",
  });
  const holdings: SharedProductDataPanelProps = {
    state: account,
    type: "positions",
    initialProduct: "prediction",
    onProductChange: () => {},
  };
  const orders: SharedProductOrdersPanelProps = {
    state: account,
    mode: "pending",
  };
  const history: MobileSharedProductHistoryProps = {
    state: account,
    initialProduct: "prediction",
  };
  const table: PredictionOrdersTableProps = orders;
  const cell: PredictionOrderCellProps | undefined = account.openOrders[0]
    ? { state: account, order: account.openOrders[0], field: "price" }
    : undefined;
  const round = markets.configBySymbol.get(account.positions[0]?.symbol ?? "");
  const status = toPredictionOrderStatus(
    toApiPredictionOrderStatus("rejected"),
  );
  const perpsProps: PredictionPerpsPanelProps = {
    onSymbolChange: () => {},
    sharePnLConfig: { backgroundImages: ["https://example.com/pnl.png"] },
    pnlNotionalDecimalPrecision: 4,
  };
  const configuredOrders: SharedProductOrdersPanelProps = {
    ...orders,
    ...perpsProps,
  };
  const configuredHistory: MobileSharedProductHistoryProps = {
    ...history,
    ...perpsProps,
  };
  const configuredHoldings: SharedProductDataPanelProps = {
    ...holdings,
    ...perpsProps,
  };
  const legacyDropdown = usePredictionMarketsDropdown();
  const callbackDropdown = usePredictionMarketsDropdown(() => {});
  const disabledDropdown = usePredictionMarketsDropdown(() => {}, {
    enabled: false,
  });
  // @ts-expect-error The prelaunch API intentionally removes the coupled loading option.
  const obsolete: UsePredictionAccountDataOptions = { includeHistory: true };
  return {
    actions,
    accountPanel,
    markets,
    counts,
    cancellation,
    holdings,
    orders,
    history,
    table,
    cell,
    round,
    status,
    obsolete,
    legacyDropdown,
    callbackDropdown,
    disabledDropdown,
    configuredOrders,
    configuredHistory,
    configuredHoldings,
  };
}

/** The original TradingPage integrates Prediction with no extra required props. */
export function automaticTradingPageContract(
  tradingViewConfig: TradingPageProps["tradingViewConfig"],
) {
  const props: TradingPageProps = {
    symbol: "PERP_BTC_USDC",
    tradingViewConfig,
    onSymbolChange: () => {},
    sharePnLConfig: { backgroundImages: ["https://example.com/pnl.png"] },
  };
  const page = createElement(TradingPage, props);
  const disabledPage = createElement(OrderlyAppProvider, {
    brokerId: "test",
    networkId: "testnet",
    features: { prediction: false },
    children: page,
  });
  return { page, disabledPage };
}

/** Prediction exposes the exact selected contract symbol. */
export function predictionPageSelectionContract() {
  const page = createElement(PredictionPage, {
    symbol: "PERP_BTC5M2608271200_USDC",
    onSymbolChange: (market: PredictionSymbolSelection) => void market.symbol,
  });
  const routedPage = createElement(PredictionPage, {
    symbol: "PERP_BTC5M2608271200_USDC",
  });
  const selection: PredictionSymbolSelection = {
    symbol: "PERP_BTC5M2608271200_USDC",
  };
  return { page, routedPage, selection };
}

export type NavigationContracts = [
  Assert<Compatible<keyof PredictionSymbolSelection, "symbol">>,
  Assert<
    "marketId" extends keyof React.ComponentProps<typeof PredictionPage>
      ? false
      : true
  >,
  Assert<
    "onMarketChange" extends keyof React.ComponentProps<typeof PredictionPage>
      ? false
      : true
  >,
  Assert<"onPredictionSelect" extends keyof TradingPageProps ? false : true>,
  Assert<
    "onPredictionSymbolChange" extends keyof React.ComponentProps<
      typeof PredictionPage
    >
      ? false
      : true
  >,
  Assert<
    "onPerpSymbolChange" extends keyof React.ComponentProps<
      typeof PredictionPage
    >
      ? false
      : true
  >,
];

export function marketsPredictionContracts() {
  const props: MarketsHomePageProps = {
    onPredictionSelect: (symbol: string) => void symbol,
    renderTabAfterContent: () => null,
  };
  return createElement(MarketsHomePage, props);
}

export type SharedAssetContracts = [
  Assert<Compatible<typeof AssetsModule.AssetsWidget, typeof AssetsWidget>>,
  Assert<
    Compatible<typeof AssetsModule.AssetsTabWidget, typeof AssetsTabWidget>
  >,
  Assert<Compatible<typeof TradingAssetViewWidget, typeof AssetViewWidget>>,
  Assert<Compatible<typeof tradingFirstDeposit, typeof useFirstTimeDeposit>>,
];

/** Application features are configured through the public provider entry. */
export function useAppFeaturesContract() {
  const features: AppFeatures = { prediction: false };
  const props: OrderlyAppProviderProps = {
    brokerId: "test",
    networkId: "testnet",
    features,
  };
  const enabled: boolean = useFeatureEnabled("prediction");
  return { props, enabled };
}

export type RemovedPredictionPageOptions = [
  Assert<"predictionEnabled" extends keyof TradingPageProps ? false : true>,
  Assert<"predictionEnabled" extends keyof MarketsHomePageProps ? false : true>,
  Assert<
    "predictionEnabled" extends keyof React.ComponentProps<
      typeof OrdersModule.OrdersPage
    >
      ? false
      : true
  >,
  Assert<
    "predictionEnabled" extends keyof React.ComponentProps<
      typeof PositionsModule.PositionsPage
    >
      ? false
      : true
  >,
];

export type RemovedBinaryInfoOption = [
  Assert<"enableBinaryInfo" extends keyof ConfigProviderProps ? false : true>,
  Assert<
    "enableBinaryInfo" extends keyof OrderlyConfigContextState ? false : true
  >,
  Assert<
    "enableBinaryInfo" extends keyof OrderlyAppProviderProps ? false : true
  >,
];

type RemovedSlots =
  | "marketsDropdown"
  | "marketsSheet"
  | "sideMarkets"
  | "dataListProductContent";
type NoSlots<T> = Extract<keyof T, RemovedSlots> extends never ? true : false;
export type RemovedCompositionInputs = [
  Assert<NoSlots<TradingPageProps>>,
  Assert<NoSlots<SharedTradingPageProps>>,
  Assert<NoSlots<NextTradingPageProps>>,
  Assert<NoSlots<React.ComponentProps<typeof TradingPageProvider>>>,
  Assert<NoSlots<React.ComponentProps<typeof NextTradingPageProvider>>>,
];

export type RemovedManualCompositionExports = [
  typeof usePredictionTradingExtension,
  PredictionTradingExtensionOptions,
  PredictionTradingExtensionProps,
  RemovedTradingTradingMarketsDropdownProps,
  RemovedTradingTradingDataListProductContent,
  RemovedTradingTradingPageExtensionProps,
  RemovedSharedTradingMarketsDropdownProps,
  RemovedSharedTradingDataListProductContent,
  RemovedSharedTradingPageExtensionProps,
];
