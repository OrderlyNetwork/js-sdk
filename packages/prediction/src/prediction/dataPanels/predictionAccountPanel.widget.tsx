import React from "react";
import { usePredictionAccountData } from "../hooks/usePredictionAccountData";
import type {
  PredictionDataTab,
  PredictionHoldingsMarketView,
} from "../prediction.types";
import { PredictionDataPanel } from "./predictionDataPanel.ui";

export interface PredictionAccountPanelProps {
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
  }: PredictionAccountPanelProps) => {
    const account = usePredictionAccountData();
    return (
      <PredictionDataPanel
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
