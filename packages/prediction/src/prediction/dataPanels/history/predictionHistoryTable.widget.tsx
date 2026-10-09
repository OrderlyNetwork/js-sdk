import React from "react";
import type { DataFilterItem } from "@orderly.network/ui";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { usePredictionHistoryTableScript } from "./predictionHistoryTable.script";
import { PredictionHistoryTableUI } from "./predictionHistoryTable.ui";

export type PredictionHistoryTableProps = {
  state: PredictionAccountPanelState;
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
};

export const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = (
  props,
) => {
  const { filters } = usePredictionHistoryTableScript();
  return <PredictionHistoryTableUI {...props} filters={filters} />;
};
