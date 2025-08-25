import React from "react";
import { useAssetsChartScript } from "../assetChart";
import { PortfolioChartsMobileUI } from "./portfolioChartsMobile.ui";

export const PortfolioChartsMobileWidget: React.FC = () => {
  const state = useAssetsChartScript();
  return <PortfolioChartsMobileUI {...state} />;
};
