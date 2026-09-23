import React from "react";
import type { DataFilterItem } from "@orderly.network/ui";
import type { PredictionState } from "../../prediction.script";
import { useHoldingsTableScript } from "./holdingsTable.script";
import { HoldingsTableUI } from "./holdingsTable.ui";

export type HoldingsTableProps = {
  state: PredictionState;
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
};

export const HoldingsTable: React.FC<HoldingsTableProps> = (props) => {
  const { filters } = useHoldingsTableScript();
  return <HoldingsTableUI {...props} filters={filters} />;
};
