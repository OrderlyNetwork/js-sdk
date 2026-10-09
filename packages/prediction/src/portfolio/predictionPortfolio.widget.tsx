import React from "react";
import { usePredictionPortfolioScript } from "./predictionPortfolio.script";
import { PredictionPortfolio } from "./predictionPortfolio.ui";

export const PredictionPortfolioWidget: React.FC = () => {
  const state = usePredictionPortfolioScript();
  return <PredictionPortfolio {...state} />;
};
