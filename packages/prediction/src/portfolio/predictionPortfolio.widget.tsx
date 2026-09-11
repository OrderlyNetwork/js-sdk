import React from "react";
import { useAppContext } from "@orderly.network/react-app";
import { useSharedPredictionState } from "../prediction/predictionProvider";
import { usePredictionPortfolioScript } from "./predictionPortfolio.script";
import { PredictionPortfolio } from "./predictionPortfolio.ui";

export const PredictionPortfolioWidget: React.FC = () => {
  const state = useSharedPredictionState();
  return state ? <PredictionPortfolio {...state} /> : <StandalonePortfolio />;
};
const StandalonePortfolio = () => {
  const { disabledConnect } = useAppContext();
  const state = usePredictionPortfolioScript(disabledConnect);
  return <PredictionPortfolio {...state} />;
};
