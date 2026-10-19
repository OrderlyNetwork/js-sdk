import { createElement } from "react";
import {
  MarketsHomePage,
  type MarketsHomePageProps,
} from "@orderly.network/markets";
// Asset extraction keeps the public Portfolio and Trading wrappers compatible.
import { AssetsModule } from "@orderly.network/portfolio";
import {
  PredictionPage,
  useBinaryOrderRows,
  type PredictionSymbolSelection,
} from "@orderly.network/prediction";
import {
  usePredictionAccountData,
  usePredictionMarkets,
  usePredictionTradingExtension,
  usePredictionMarketsDropdown,
  type PredictionTradingExtensionOptions,
  type PredictionTradingExtensionProps,
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
import {
  TradingPage,
  type TradingPageProps,
  type TradingMarketsDropdownProps,
  type TradingPerpsPanelProps,
  type TradingDataListProductContent,
  type TradingPageExtensionProps,
} from "@orderly.network/trading";
import {
  AssetViewWidget as TradingAssetViewWidget,
  useFirstTimeDeposit as tradingFirstDeposit,
} from "@orderly.network/trading";
import type {
  TradingMarketsDropdownProps as CommonMarketsDropdownProps,
  TradingPerpsPanelProps as CommonPerpsPanelProps,
  TradingDataListProductContent as CommonDataListProductContent,
  TradingPageExtensionProps as CommonPageExtensionProps,
} from "@orderly.network/trading-shared";
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
  Assert<Compatible<TradingMarketsDropdownProps, CommonMarketsDropdownProps>>,
  Assert<Compatible<TradingPerpsPanelProps, CommonPerpsPanelProps>>,
  Assert<
    Compatible<TradingDataListProductContent, CommonDataListProductContent>
  >,
  Assert<Compatible<TradingPageExtensionProps, CommonPageExtensionProps>>,
  Assert<Compatible<PredictionPerpsPanelProps, TradingPerpsPanelProps>>,
  Assert<
    Compatible<PredictionTradingExtensionProps, TradingPageExtensionProps>
  >,
  Assert<
    Compatible<
      TradingPageExtensionProps,
      Pick<TradingPageProps, "marketsDropdown" | "dataListProductContent">
    >
  >,
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
  const extensionOptions: PredictionTradingExtensionOptions = {
    symbol: "PERP_BTC_USDC",
    showAllSymbol: false,
    onPredictionSelect: () => {},
    onSymbolChange: () => {},
    sharePnLConfig: { backgroundImages: ["https://example.com/pnl.png"] },
    pnlNotionalDecimalPrecision: 4,
    marketsEnabled: false,
    accountPanelsEnabled: true,
  };
  const extension: PredictionTradingExtensionProps =
    usePredictionTradingExtension(extensionOptions);
  const perpsProps: PredictionPerpsPanelProps = extensionOptions;
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
  const pageExtension: Pick<
    TradingPageProps,
    "marketsDropdown" | "dataListProductContent"
  > = extension;
  const customExtension: PredictionTradingExtensionProps = {
    ...extension,
    dataListProductContent: {
      ...extension.dataListProductContent,
      pending: "Custom pending panel",
      mobile: {
        ...extension.dataListProductContent?.mobile,
        pending: "Custom pending panel",
      },
    },
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
    pageExtension,
    customExtension,
    legacyDropdown,
    callbackDropdown,
    disabledDropdown,
    configuredOrders,
    configuredHistory,
    configuredHoldings,
  };
}

/** Minimal host page props remain compatible with the adapter's public result. */
export function usePredictionTradingPageContract(
  tradingViewConfig: TradingPageProps["tradingViewConfig"],
): TradingPageProps {
  const extension = usePredictionTradingExtension({
    symbol: "PERP_BTC_USDC",
    showAllSymbol: false,
    onPredictionSelect: () => {},
  });
  return {
    ...extension,
    predictionEnabled: false,
    symbol: "PERP_BTC_USDC",
    tradingViewConfig,
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
  const disabledPage = createElement(TradingPage, {
    ...props,
    predictionEnabled: false,
  });
  const customPage = createElement(TradingPage, {
    ...props,
    marketsDropdown: {},
    dataListProductContent: { pending: "Custom pending panel" },
  });
  return { page, disabledPage, customPage };
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
    predictionEnabled: true,
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
