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
import type { TradingPageProps } from "@orderly.network/trading";

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
    symbol: "PERP_BTC_USDC",
    tradingViewConfig,
  };
}
