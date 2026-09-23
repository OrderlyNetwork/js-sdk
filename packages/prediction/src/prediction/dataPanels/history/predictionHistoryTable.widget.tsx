import React from "react";
import type { DataFilterItem } from "@orderly.network/ui";
import type { PredictionState } from "../../prediction.script";
import { usePredictionHistoryTableScript } from "./predictionHistoryTable.script";
import { PredictionHistoryTableUI } from "./predictionHistoryTable.ui";

export type PredictionHistoryTableProps = {
  state: PredictionState;
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
};

export const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = (
  props,
) => {
  const { filters } = usePredictionHistoryTableScript();
  return <PredictionHistoryTableUI {...props} filters={filters} />;
};
