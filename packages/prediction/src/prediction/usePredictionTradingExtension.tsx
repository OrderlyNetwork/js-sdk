import type {
  TradingDataListProductContent,
  TradingPageExtensionProps,
} from "@orderly.network/trading-shared";
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
import { usePredictionMarketTabs } from "./predictionMarketPanel.ui";
import { usePredictionMarketsDropdown } from "./usePredictionMarketsDropdown";

export interface PredictionTradingExtensionOptions extends PredictionPerpsPanelProps {
  /** Current Perps symbol, also used to scope Prediction underlying markets. */
  symbol: string;
  /** Follow the host trading page's all-symbol preference. */
  showAllSymbol: boolean;
  /**
   * Receives the exact round symbol, e.g. `PERP_BTC5M2608271200_USDC`.
   * The host owns navigation and URL parameters.
   */
  onPredictionSelect: (symbol: string) => void;
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
  // One shared data pipeline (above) feeds every surface; only the default tab
  // set differs per surface, so each slot reuses the surface-agnostic
  // renderers and just swaps in its own tabs.
  const sheetTabs = usePredictionMarketTabs("marketsSheet");
  const sideMarketsTabs = usePredictionMarketTabs("expandMarkets");
  return {
    ...(dropdownEnabled
      ? {
          marketsDropdown,
          marketsSheet: {
            tabs: sheetTabs,
            renderTabContent: marketsDropdown.renderTabContent,
            renderTabAfterContent: marketsDropdown.renderTabAfterContent,
          },
          sideMarkets: {
            tabs: sideMarketsTabs,
            renderTabContent: marketsDropdown.renderTabContent,
            renderTabAfterContent: marketsDropdown.renderTabAfterContent,
          },
        }
      : {}),
    ...(accountEnabled
      ? {
          dataListProductContent: buildDataListProductContent(
            // Prediction rows navigate to their round via the host's
            // prediction route (same channel as the markets dropdown).
            { ...state, onSelectRoundSymbol: onPredictionSelect },
            counts,
            scopedSymbol,
            { onSymbolChange, sharePnLConfig, pnlNotionalDecimalPrecision },
          ),
        }
      : {}),
  };
}
