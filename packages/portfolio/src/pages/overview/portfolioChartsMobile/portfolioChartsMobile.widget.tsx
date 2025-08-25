import React from "react";
import { EMPTY_LIST } from "@orderly.network/types";
import { useAssetsChartScript } from "../assetChart";
import { usePortfolioChartsState } from "./portfolioChartsMobile.script";
import { PortfolioChartsMobileUI } from "./portfolioChartsMobile.ui";

export const PortfolioChartsMobileWidget: React.FC = () => {
  const { data } = useAssetsChartScript();
  const state = usePortfolioChartsState();
  return <PortfolioChartsMobileUI data={data || EMPTY_LIST} {...state} />;
};
