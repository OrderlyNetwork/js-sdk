import React from "react";
import type { DataFilterItem } from "@orderly.network/ui";
import type { PredictionState } from "../../prediction.script";
import {
  usePredictionOrdersTableScript,
  type PredictionOrdersTableMode,
} from "./predictionOrdersTable.script";
import { PredictionOrdersTableUI } from "./predictionOrdersTable.ui";

export type PredictionOrdersTableProps = {
  state: PredictionState;
  mode: PredictionOrdersTableMode;
  status?: "cancelled" | "unsupported";
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
};

export const PredictionOrdersTable: React.FC<PredictionOrdersTableProps> = ({
  mode,
  ...props
}) => {
  const { filters } = usePredictionOrdersTableScript(mode);
  return <PredictionOrdersTableUI {...props} mode={mode} filters={filters} />;
};
