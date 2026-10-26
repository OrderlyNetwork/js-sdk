import React from "react";
import { usePredictionAccountData } from "../hooks/usePredictionAccountData";
import type {
  PredictionDataTab,
  PredictionHoldingsMarketView,
} from "../prediction.types";
import type { PredictionPerpsPanelProps } from "./perpsPanel.types";
import { PredictionDataPanel } from "./predictionDataPanel.ui";

export interface PredictionAccountPanelProps extends Pick<
  PredictionPerpsPanelProps,
  "onSymbolChange"
> {
  activeTab: PredictionDataTab;
  setActiveTab(tab: PredictionDataTab): void;
  marketView?: PredictionHoldingsMarketView;
  isSubmitting: boolean;
  isRegionRestricted: boolean;
  onSelectRoundSymbol?: (symbol: string) => void;
}

/** Page-owned controls and account-owned queries are connected without broadcasting page state. */
export const PredictionAccountPanel = React.memo(
  ({
    activeTab,
    setActiveTab,
    marketView,
    isSubmitting,
    isRegionRestricted,
    onSelectRoundSymbol,
    onSymbolChange,
  }: PredictionAccountPanelProps) => {
    const account = usePredictionAccountData();
    return (
      <PredictionDataPanel
        onSymbolChange={onSymbolChange}
        state={{
          ...account,
          activeTab,
          setActiveTab,
          marketView,
          isSubmitting: isSubmitting || account.isSubmitting,
          isRegionRestricted: isRegionRestricted || account.isRegionRestricted,
          onSelectRoundSymbol,
        }}
      />
    );
  },
);
