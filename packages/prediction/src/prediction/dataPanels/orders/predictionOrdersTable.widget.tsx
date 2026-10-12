import React, { useEffect, useState } from "react";
import { OrderSide } from "@orderly.network/types";
import type { DataFilterItem } from "@orderly.network/ui";
import { toOrderStatus } from "../../binary/binaryOrderDisplay";
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
  const scope = JSON.stringify([
    mode,
    filters.side,
    filters.status,
    filters.outcome,
    filters.dateRange.from?.getTime(),
    filters.dateRange.to?.getTime(),
    props.predictionUnderlyingSymbol,
  ]);
  const [paginationRequest, setPaginationRequest] = useState({
    scope,
    page: 1,
  });
  const requestedPage =
    paginationRequest.scope === scope ? paginationRequest.page : 1;
  const setRequestedPage = (page: number) =>
    setPaginationRequest({ scope, page });
  const apiStatus = toOrderStatus(filters.status);
  const binary = useBinaryOrderRows({
    mode,
    underlyingSymbol: props.predictionUnderlyingSymbol,
    side:
      filters.side === "buy"
        ? OrderSide.BUY
        : filters.side === "sell"
          ? OrderSide.SELL
          : undefined,
    status: mode === "history" && apiStatus !== "all" ? apiStatus : undefined,
    dateRange: filters.dateRange,
  });
  // Filled rows are client-filtered (has-executions semantics over an
  // all-status query), so the server total no longer matches the visible rows:
  // fall back to the load-more pattern instead of counted pagination.
  const clientFiltered =
    mode === "filled" ||
    Boolean(props.predictionUnderlyingSymbol || filters.outcome !== "all");
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
