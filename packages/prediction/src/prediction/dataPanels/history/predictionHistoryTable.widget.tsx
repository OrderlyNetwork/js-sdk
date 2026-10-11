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

export const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = ({
  state,
  predictionUnderlyingSymbol,
  ...rest
}) => {
  const { filters, historyState } = usePredictionHistoryTableScript(
    state,
    predictionUnderlyingSymbol,
  );
  return (
    <PredictionHistoryTableUI
      {...rest}
      filters={filters}
      displayRecords={historyState.displayRecords}
    />
  );
};
