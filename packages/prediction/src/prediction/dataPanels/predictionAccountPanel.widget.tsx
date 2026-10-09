import React from "react";
import { usePredictionAccountData } from "../hooks/usePredictionAccountData";
import type {
  PredictionDataTab,
  PredictionHoldingsMarketView,
} from "../prediction.types";
import { PredictionDataPanel } from "./predictionDataPanel.ui";

/** Page-owned controls and account-owned queries are connected without broadcasting page state. */
export const PredictionAccountPanel = React.memo(
  ({
    activeTab,
    setActiveTab,
    marketView,
    isSubmitting,
    isRegionRestricted,
  }: {
    activeTab: PredictionDataTab;
    setActiveTab: (tab: PredictionDataTab) => void;
    marketView?: PredictionHoldingsMarketView;
    isSubmitting: boolean;
    isRegionRestricted: boolean;
  }) => {
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
        }}
      />
    );
  },
);
