import React from "react";
import type { DataFilterItem } from "@orderly.network/ui";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { usePredictionHistoryTableScript } from "./predictionHistoryTable.script";
import { PredictionHistoryTableUI } from "./predictionHistoryTable.ui";

export type PredictionHistoryTableProps = {
  state: PredictionAccountPanelState;
  predictionUnderlyingSymbol?: string;
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
};

export const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = (
  props,
) => {
  const { filters, historyState } = usePredictionHistoryTableScript(
    props.state,
    props.predictionUnderlyingSymbol,
  );
  return (
    <PredictionHistoryTableUI
      {...props}
      state={{ ...props.state, ...historyState }}
      filters={filters}
    />
  );
};
