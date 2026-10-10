import type {
  TradingDataListProductContent,
  TradingPageExtensionProps,
} from "@orderly.network/trading-common";
import type { PredictionPerpsPanelProps } from "./dataPanels/perpsPanel.types";
import { SharedProductDataPanel } from "./dataPanels/sharedProductDataPanel.ui";
import { MobileSharedProductHistory } from "./dataPanels/sharedProductHistory.mobile.ui";
import { MobileSharedProductOrdersPanel } from "./dataPanels/sharedProductOrdersPanel.mobile.ui";
import { SharedProductOrdersPanel } from "./dataPanels/sharedProductOrdersPanel.ui";
import {
  useSharedProductCounts,
  type SharedProductCountsState,
} from "./dataPanels/useSharedProductCounts";
import { usePredictionAccountData } from "./hooks/usePredictionAccountData";
import type { PredictionAccountPanelState } from "./prediction.types";
import { usePredictionMarketsDropdown } from "./usePredictionMarketsDropdown";

export interface PredictionTradingExtensionOptions extends PredictionPerpsPanelProps {
  /** Current Perps symbol, also used to scope Prediction underlying markets. */
  symbol: string;
  /** Follow the host trading page's all-symbol preference. */
  showAllSymbol: boolean;
  /**
   * Receives a market family ID, e.g. `PERP_BTC5M_USDC`, shared across rounds,
   * rather than a tradable round symbol. The host owns navigation and URL parameters.
   */
  onPredictionSelect: (marketId: string) => void;
  /** Enable Prediction resources and extension slots; defaults to true. */
  enabled?: boolean;
  /** Enable the markets dropdown resources and slot; defaults to true. */
  marketsEnabled?: boolean;
  /** Enable account panel resources, counts, and slots; defaults to true. */
  accountPanelsEnabled?: boolean;
}

export type PredictionTradingExtensionProps = TradingPageExtensionProps;

/** Assemble slots without mounting their history queries until displayed. */
function buildDataListProductContent(
  state: PredictionAccountPanelState,
  counts: SharedProductCountsState,
  scopedSymbol?: string,
  perpsProps: PredictionPerpsPanelProps = {},
): TradingDataListProductContent {
  const scope = {
    ...perpsProps,
    state,
    perpsSymbol: scopedSymbol,
    predictionUnderlyingSymbol: scopedSymbol,
  };
  return {
    counts,
    positions: (perpsPositionsContent) => (
      <SharedProductDataPanel
        {...scope}
        type="positions"
        initialProduct="perps"
        perpsPositionsContent={perpsPositionsContent}
      />
    ),
    pending: <SharedProductOrdersPanel {...scope} mode="pending" />,
    filled: <SharedProductOrdersPanel {...scope} mode="filled" />,
    positionHistory: (
      <SharedProductDataPanel
        {...scope}
        type="positionHistory"
        initialProduct="perps"
      />
    ),
    orderHistory: <SharedProductOrdersPanel {...scope} mode="history" />,
    mobile: {
      positions: (perpsPositionsContent) => (
        <SharedProductDataPanel
          {...scope}
          type="positions"
          initialProduct="perps"
          mobile
          perpsPositionsContent={perpsPositionsContent}
        />
      ),
      pending: <MobileSharedProductOrdersPanel {...scope} mode="pending" />,
      history: <MobileSharedProductHistory {...scope} initialProduct="perps" />,
    },
  };
}

/** Connect Prediction to an existing TradingPage without owning page routing. */
export function usePredictionTradingExtension({
  symbol,
  showAllSymbol,
  onPredictionSelect,
  enabled = true,
  marketsEnabled = true,
  accountPanelsEnabled = true,
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
}: PredictionTradingExtensionOptions): PredictionTradingExtensionProps {
  const scopedSymbol = showAllSymbol ? undefined : symbol;
  const accountEnabled = enabled && accountPanelsEnabled;
  const dropdownEnabled = enabled && marketsEnabled;
  const state = usePredictionAccountData({ enabled: accountEnabled });
  const counts = useSharedProductCounts({
    product: "all",
    perpsSymbol: scopedSymbol,
    predictionUnderlyingSymbol: scopedSymbol,
    enabled: accountEnabled,
  });
  const marketsDropdown = usePredictionMarketsDropdown(onPredictionSelect, {
    enabled: dropdownEnabled,
  });
  return {
    ...(dropdownEnabled ? { marketsDropdown } : {}),
    ...(accountEnabled
      ? {
          dataListProductContent: buildDataListProductContent(
            state,
            counts,
            scopedSymbol,
            { onSymbolChange, sharePnLConfig, pnlNotionalDecimalPrecision },
          ),
        }
      : {}),
  };
}
