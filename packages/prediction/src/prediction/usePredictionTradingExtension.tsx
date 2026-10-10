import type { TradingPageProps } from "@orderly.network/trading";
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
  /** The host application owns navigation and URL parameters. */
  onPredictionSelect: (marketId: string) => void;
  /** Enable Prediction resources and extension slots; defaults to true. */
  enabled?: boolean;
}

export type PredictionTradingExtensionProps = Pick<
  TradingPageProps,
  "marketsDropdown" | "dataListProductContent"
>;

/** Assemble slots without mounting their history queries until displayed. */
function buildDataListProductContent(
  state: PredictionAccountPanelState,
  counts: SharedProductCountsState,
  scopedSymbol?: string,
  perpsProps: PredictionPerpsPanelProps = {},
): TradingPageProps["dataListProductContent"] {
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
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
}: PredictionTradingExtensionOptions): PredictionTradingExtensionProps {
  const scopedSymbol = showAllSymbol ? undefined : symbol;
  const state = usePredictionAccountData({ enabled });
  const counts = useSharedProductCounts({
    product: "all",
    perpsSymbol: scopedSymbol,
    predictionUnderlyingSymbol: scopedSymbol,
    enabled,
  });
  const marketsDropdown = usePredictionMarketsDropdown(onPredictionSelect, {
    enabled,
  });
  return enabled
    ? {
        marketsDropdown,
        dataListProductContent: buildDataListProductContent(
          state,
          counts,
          scopedSymbol,
          { onSymbolChange, sharePnLConfig, pnlNotionalDecimalPrecision },
        ),
      }
    : {};
}
