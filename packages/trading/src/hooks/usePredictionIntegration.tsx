import {
  SharedProductDataPanel,
  SharedProductOrdersPanel,
  MobileSharedProductOrdersPanel,
  MobileSharedProductHistory,
  useSharedProductCounts,
  usePredictionAccountData,
  usePredictionMarketTabs,
  usePredictionMarketsDropdown,
  type SharedProductCountsState,
  type PredictionAccountPanelState,
} from "@orderly.network/prediction";
import { useFeatureEnabled } from "@orderly.network/react-app";
import type { TradingPerpsPanelProps } from "@orderly.network/trading-shared";
import type {
  PredictionAccountPanels,
  PredictionIntegrationState,
} from "../types/predictionIntegration";

export interface PredictionIntegrationOptions extends TradingPerpsPanelProps {
  symbol: string;
  showAllSymbol: boolean;
  onPredictionSelect?: (symbol: string) => void;
  marketsEnabled?: boolean;
}

/** Assemble slots without mounting their history queries until displayed. */
function buildDataListProductContent(
  state: PredictionAccountPanelState,
  counts: SharedProductCountsState,
  scopedSymbol?: string,
  perpsProps: TradingPerpsPanelProps = {},
): PredictionAccountPanels {
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
export function usePredictionIntegration({
  symbol,
  showAllSymbol,
  onPredictionSelect,
  marketsEnabled = true,
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
}: PredictionIntegrationOptions): PredictionIntegrationState {
  const predictionEnabled = useFeatureEnabled("prediction");
  const scopedSymbol = showAllSymbol ? undefined : symbol;
  const accountEnabled = predictionEnabled;
  const dropdownEnabled = predictionEnabled && marketsEnabled;
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
    marketsDropdown: dropdownEnabled ? marketsDropdown : undefined,
    marketsSheet: dropdownEnabled
      ? {
          tabs: sheetTabs,
          renderTabContent: marketsDropdown.renderTabContent,
          renderTabAfterContent: marketsDropdown.renderTabAfterContent,
        }
      : undefined,
    sideMarkets: dropdownEnabled
      ? {
          tabs: sideMarketsTabs,
          renderTabContent: marketsDropdown.renderTabContent,
          renderTabAfterContent: marketsDropdown.renderTabAfterContent,
        }
      : undefined,
    dataListProductContent: accountEnabled
      ? buildDataListProductContent(
          { ...state, onSelectRoundSymbol: onPredictionSelect },
          counts,
          scopedSymbol,
          { onSymbolChange, sharePnLConfig, pnlNotionalDecimalPrecision },
        )
      : undefined,
  };
}
