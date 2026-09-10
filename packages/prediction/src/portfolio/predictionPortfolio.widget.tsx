import React from "react";
import { useAppContext } from "@orderly.network/react-app";
import { usePredictionPortfolioScript } from "./predictionPortfolio.script";
import { PredictionPortfolio } from "./predictionPortfolio.ui";

export const PredictionPortfolioWidget: React.FC = () => {
  const { disabledConnect } = useAppContext();
  const state = usePredictionPortfolioScript(disabledConnect);
  return <PredictionPortfolio {...state} />;
};
