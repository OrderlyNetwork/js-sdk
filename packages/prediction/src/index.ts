export { default as version } from "./version";
export { useBinaryRegionRestricted } from "./prediction/binary/useBinaryRegion";
export * from "./prediction";
export {
  PredictionOrdersTable,
  PredictionOrderCell,
  SharedProductDataPanel,
  SharedProductOrdersPanel,
  MobileSharedProductOrdersPanel,
  MobileSharedProductHistory,
  useSharedProductCounts,
} from "./prediction/prediction.ui";
export {
  useProductOrderCancelAll,
  type ProductOrderCancelAllOptions,
  type ProductOrderCancelAllState,
} from "./prediction/dataPanels/useProductOrderCancelAll";
export type {
  ProductOrderInstrument,
  BinaryCancelAllOptions,
} from "./prediction/dataPanels/productOrderCancellation";

export {
  normalizeBinaryHistory,
  binaryHistoryRange,
  binaryHistoryCompleteness,
  summarizeBinaryHistory,
  type BinaryHistoryRecord,
  type BinaryHistoryState,
  type BinaryHistoryCompleteness,
  type BinaryHistoryRange,
} from "./prediction/binary/binaryHistory";
export {
  binaryHistoryCsv,
  type BinaryHistoryCsvResult,
} from "./prediction/binary/binaryHistoryCsv";
export { usePredictionAccountData } from "./prediction/hooks/usePredictionAccountData";
export { usePredictionMarkets } from "./prediction/hooks/usePredictionMarkets";
export {
  usePredictionTradingExtension,
  type PredictionTradingExtensionOptions,
  type PredictionTradingExtensionProps,
} from "./prediction/usePredictionTradingExtension";
export type {
  PredictionMarketSelection,
  PredictionMarket,
  PredictionMarketsState,
  UsePredictionMarketsOptions,
  UsePredictionAccountDataOptions,
  PredictionSettlementHistoryState,
  PredictionPosition,
  PredictionOpenOrder,
  PredictionTrade,
  PredictionSettlement,
  PredictionDataTab,
  PredictionAccountState,
  PredictionAccountActions,
  PredictionAccountPanelState,
  PredictionHoldingsMarketView,
  BinaryOrderCancellationCapability,
} from "./prediction/prediction.types";

export type { BinaryFeeRates } from "./prediction/binary/useBinaryFeeRates";
export type { SharedProductDataPanelProps } from "./prediction/dataPanels/sharedProductDataPanel.ui";
export type { PredictionOrdersTableProps } from "./prediction/dataPanels/orders/predictionOrdersTable.widget";

export type {
  UseSharedProductCountsOptions,
  SharedProductCountsState,
} from "./prediction/dataPanels/useSharedProductCounts";
export type { SharedProductOrdersPanelProps } from "./prediction/dataPanels/sharedProductOrdersPanel.ui";
export type { MobileSharedProductHistoryProps } from "./prediction/dataPanels/sharedProductHistory.mobile.ui";
export type { ProductOrderMode } from "./prediction/dataPanels/sharedProductOrdersPanel.script";

export {
  toPredictionStatus as toPredictionOrderStatus,
  toOrderStatus as toApiPredictionOrderStatus,
} from "./prediction/binary/binaryOrderDisplay";
export type { PredictionOrderCellProps } from "./prediction/dataPanels/orders/predictionOrderCell.ui";
export type { PredictionAccountPanelProps } from "./prediction/dataPanels/predictionAccountPanel.widget";
