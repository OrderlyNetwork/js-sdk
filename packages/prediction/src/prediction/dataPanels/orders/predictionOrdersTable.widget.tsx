import React, { useEffect, useState } from "react";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import type { DataFilterItem } from "@orderly.network/ui";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { useProductOrderCancelAll } from "../useProductOrderCancelAll";
import {
  usePredictionOrdersTableScript,
  type PredictionOrdersTableMode,
} from "./predictionOrdersTable.script";
import { PredictionOrdersTableUI } from "./predictionOrdersTable.ui";
import { useBinaryOrderRows } from "./useBinaryOrderRows";

export type PredictionOrdersTableProps = {
  state: PredictionAccountPanelState;
  mode: PredictionOrdersTableMode;
  status?: "cancelled" | "unsupported";
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
  predictionUnderlyingSymbol?: string;
};

export const PredictionOrdersTable: React.FC<PredictionOrdersTableProps> = ({
  mode,
  ...props
}) => {
  const { filters } = usePredictionOrdersTableScript(mode);
  const cancellation = useProductOrderCancelAll({
    binary: props.state,
    enabled: mode === "pending",
    instrument: "prediction",
    predictionUnderlyingSymbol: props.predictionUnderlyingSymbol,
  });
  const [requestedPage, setRequestedPage] = useState(1);
  const binary = useBinaryOrderRows({
    mode,
    underlyingSymbol: props.predictionUnderlyingSymbol,
    side:
      filters.side === "buy"
        ? OrderSide.BUY
        : filters.side === "sell"
          ? OrderSide.SELL
          : undefined,
    status:
      mode === "history"
        ? filters.status === "pending"
          ? OrderStatus.INCOMPLETE
          : filters.status === "filled"
            ? OrderStatus.FILLED
            : filters.status === "cancelled"
              ? OrderStatus.CANCELLED
              : undefined
        : undefined,
    dateRange: filters.dateRange,
  });
  const clientFiltered = Boolean(
    props.predictionUnderlyingSymbol || filters.outcome !== "all",
  );
  useEffect(() => {
    if (
      !clientFiltered &&
      binary.hasMore &&
      binary.rows.length < requestedPage * 20 &&
      !binary.isValidating
    ) {
      binary.loadMore();
    }
  }, [
    binary.hasMore,
    binary.rows.length,
    binary.isValidating,
    binary.loadMore,
    clientFiltered,
    requestedPage,
  ]);
  useEffect(
    () => setRequestedPage(1),
    [
      filters.side,
      filters.status,
      filters.outcome,
      filters.dateRange,
      props.predictionUnderlyingSymbol,
    ],
  );
  return (
    <PredictionOrdersTableUI
      {...props}
      mode={mode}
      filters={filters}
      cancelAllDisabled={cancellation.disabled}
      onCancelAll={cancellation.onCancelAll}
      orders={binary.rows}
      totalCount={clientFiltered ? undefined : binary.total}
      onPageChange={setRequestedPage}
      hasMore={binary.hasMore}
      loadMore={binary.loadMore}
    />
  );
};
