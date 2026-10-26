import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, EmptyDataState } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import { AuthGuardEmpty, useAuthGuard } from "@orderly.network/ui-connector";
import { MobileOrderList } from "@orderly.network/ui-orders";
import { usePredictionFilters } from "../predictionFilters.script";
import { PredictionFilters } from "./filters/predictionFilters.ui";
import { matchesPredictionOrderFilters } from "./orders/matchesPredictionOrderFilters";
import { MobilePredictionOrderCard } from "./predictionMobileCards.ui";
import {
  buildProductFilterItems,
  toOrderSide,
  toOrderStatus,
  useAllProductOrdersTableScript,
  useSharedProductOrdersPanelScript,
} from "./sharedProductOrdersPanel.script";
import type { SharedProductOrdersPanelProps } from "./sharedProductOrdersPanel.ui";
import { useScopedPredictionAccount } from "./useScopedPredictionAccount";

export type { SharedProductOrdersPanelProps } from "./sharedProductOrdersPanel.ui";

export const MobileSharedProductOrdersPanel: React.FC<
  SharedProductOrdersPanelProps
> = ({
  state,
  mode,
  perpsSymbol,
  predictionUnderlyingSymbol,
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
}) => {
  const { t } = useTranslation();
  const scopedState = useScopedPredictionAccount(
    state,
    predictionUnderlyingSymbol,
  );
  const authorized = useAuthGuard();
  const { instrument, onProductFilter } = useSharedProductOrdersPanelScript();
  const filters = usePredictionFilters(mode === "history");
  const {
    orderListState,
    predictionOrders,
    binary,
    perpsHasMore,
    loadMorePerps,
    cancelAllDisabled: sharedCancelAllDisabled,
  } = useAllProductOrdersTableScript({
    state: scopedState,
    mode,
    mobile: true,
    onSymbolChange,
    sharePnLConfig,
    pnlNotionalDecimalPrecision,
    includePrediction: instrument !== "perps",
    instrument,
    perpsSymbol,
    predictionUnderlyingSymbol,
  });
  const productFilterItems: DataFilterItem[] = buildProductFilterItems(
    t,
    instrument,
  );
  const filteredPredictionOrders = predictionOrders.filter((order) =>
    matchesPredictionOrderFilters(filters, order),
  );
  const supplementalRows =
    instrument === "perps"
      ? []
      : filteredPredictionOrders.map((order) => ({
          id: `prediction-${order.order_id}`,
          timestamp: order.created_time,
          renderItem: () => (
            <MobilePredictionOrderCard state={scopedState} order={order} />
          ),
        }));
  const predictionOnly = instrument === "prediction";
  const loadMore = () => {
    if (instrument !== "prediction" && perpsHasMore) loadMorePerps();
    if (instrument !== "perps" && binary.hasMore) binary.loadMore();
  };
  const canLoadMore =
    (instrument !== "prediction" && perpsHasMore) ||
    (instrument !== "perps" && binary.hasMore);
  const clientFiltered = Boolean(predictionUnderlyingSymbol);
  const perpsStatusOptions = [
    { label: t("common.status.all"), value: "all" },
    { label: t("orders.status.pending"), value: "pending" },
    { label: t("orders.status.filled"), value: "filled" },
    { label: t("orders.status.partialFilled"), value: "partialFilled" },
    { label: t("orders.status.canceled"), value: "cancelled" },
    { label: t("orders.status.rejected"), value: "rejected" },
  ];
  const perpsOnFilter = orderListState.onFilter;
  const onSharedFilter = ({
    name,
    value,
  }: {
    name: string;
    value: unknown;
  }) => {
    if (name === "side") {
      perpsOnFilter({ name, value: toOrderSide(value) });
    } else if (name === "status" && mode === "history") {
      perpsOnFilter({ name, value: toOrderStatus(value) });
    } else if (name === "dateRange") {
      perpsOnFilter({ name, value });
    }
  };
  const onMobileProductFilter = (filter: { name: string; value: unknown }) => {
    if (
      filter.value === "prediction" &&
      (filters.status === "partialFilled" || filters.status === "rejected")
    ) {
      filters.onFilter({ name: "status", value: "all" });
      perpsOnFilter({ name: "status", value: "all" });
    }
    onProductFilter(filter);
  };
  const cancelAllDisabled = sharedCancelAllDisabled;
  const onCancelAllClick = orderListState.onCancelAll;

  return (
    <div className="oui-w-full">
      <PredictionFilters
        filters={filters}
        mode={mode}
        leadingItems={productFilterItems}
        onLeadingFilter={onMobileProductFilter}
        onFilter={onSharedFilter}
        statusOptions={predictionOnly ? undefined : perpsStatusOptions}
        trailing={
          mode === "pending" ? (
            <Button
              size="xs"
              variant="outlined"
              color="secondary"
              disabled={cancelAllDisabled}
              onClick={onCancelAllClick}
            >
              {t("orders.cancelAll")}
            </Button>
          ) : undefined
        }
      />
      {!authorized ? (
        <AuthGuardEmpty />
      ) : predictionOnly && supplementalRows.length === 0 ? (
        <div className="oui-py-8">
          <EmptyDataState />
        </div>
      ) : (
        <MobileOrderList
          {...orderListState}
          dataSource={predictionOnly ? [] : orderListState.dataSource}
          isLoading={Boolean(
            orderListState.isLoading ||
            orderListState.isValidating ||
            binary.isLoading ||
            binary.isValidating,
          )}
          loadMore={loadMore}
          supplementalRows={supplementalRows}
          showFilter={false}
          classNames={{
            root: "oui-w-full oui-hide-scrollbar",
            content: "!oui-space-y-2 oui-p-2",
            cell: "oui-rounded-xl oui-bg-base-9 oui-p-3",
          }}
        />
      )}
      {authorized && clientFiltered && canLoadMore && (
        <Button
          size="sm"
          variant="outlined"
          onClick={loadMore}
          disabled={Boolean(orderListState.isValidating || binary.isValidating)}
        >
          {t("orders.loadMore")}
        </Button>
      )}
    </div>
  );
};
