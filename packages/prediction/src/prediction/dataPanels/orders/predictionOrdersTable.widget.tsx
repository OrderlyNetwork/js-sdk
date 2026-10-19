import React, { useEffect, useMemo, useState } from "react";
import { OrderSide } from "@orderly.network/types";
import type { DataFilterItem } from "@orderly.network/ui";
import {
  binaryOrderDisplayStatus,
  toOrderStatus,
} from "../../binary/binaryOrderDisplay";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { shouldLoadMoreProductOrders } from "../productOrderPagination";
import { useProductOrderCancelAll } from "../useProductOrderCancelAll";
import { matchesPredictionOrderFilters } from "./matchesPredictionOrderFilters";
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
    props.state.accountId,
    mode,
    filters.side,
    filters.status,
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
  const orders = useMemo(
    () =>
      binary.rows.filter(
        (order) =>
          (!props.status ||
            (props.status === "cancelled" &&
              binaryOrderDisplayStatus(order) === "cancelled")) &&
          matchesPredictionOrderFilters(filters, order),
      ),
    [binary.rows, props.status, filters],
  );
  // Client filters have no server total. Fill the visible page and look ahead
  // one matching row so the next page remains reachable without Load more.
  const clientFiltered =
    mode === "filled" ||
    filters.side !== "all" ||
    Boolean(props.predictionUnderlyingSymbol);
  useEffect(() => {
    if (
      !binary.error &&
      shouldLoadMoreProductOrders({
        loaded: clientFiltered ? orders.length : binary.rows.length,
        page: requestedPage,
        hasMore: binary.hasMore,
        isValidating: binary.isLoading || binary.isValidating,
      })
    ) {
      binary.loadMore();
    }
  }, [
    binary.hasMore,
    binary.error,
    binary.isLoading,
    orders.length,
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
      orders={orders}
      totalCount={clientFiltered ? undefined : binary.total}
      onPageChange={setRequestedPage}
      loading={binary.isLoading || binary.isValidating}
    />
  );
};
