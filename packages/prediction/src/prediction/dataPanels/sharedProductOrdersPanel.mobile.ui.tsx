import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, EmptyDataState } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import { AuthGuardEmpty, useAuthGuard } from "@orderly.network/ui-connector";
import { MobileOrderList } from "@orderly.network/ui-orders";
import type { PredictionState } from "../prediction.script";
import { usePredictionFilters } from "../predictionFilters.script";
import { PredictionFilters } from "./filters/predictionFilters.ui";
import { MobilePredictionOrderCard } from "./predictionMobileCards.ui";
import {
  toOrderSide,
  toOrderStatus,
  useAllProductOrdersTableScript,
  useSharedProductOrdersPanelScript,
  type ProductOrderMode,
} from "./sharedProductOrdersPanel.script";

export const MobileSharedProductOrdersPanel: React.FC<{
  state: PredictionState;
  mode: ProductOrderMode;
}> = ({ state, mode }) => {
  const { t } = useTranslation();
  const authorized = useAuthGuard();
  const { instrument, onProductFilter } = useSharedProductOrdersPanelScript();
  const filters = usePredictionFilters(mode === "history");
  const { orderListState, predictionOrders } = useAllProductOrdersTableScript({
    state,
    mode,
    mobile: true,
  });
  const productFilterItems: DataFilterItem[] = [
    {
      type: "select",
      name: "instrument",
      value: instrument,
      options: [
        { label: t("prediction.filter.allInstruments"), value: "all" },
        { label: t("common.perps"), value: "perps" },
        { label: t("prediction.title"), value: "prediction" },
      ],
    },
  ];
  const filteredPredictionOrders = predictionOrders.filter((order) =>
    filters.matches({
      ...order,
      status: "status" in order ? String(order.status) : "pending",
    }),
  );
  const supplementalRows =
    instrument === "perps"
      ? []
      : filteredPredictionOrders.map((order) => ({
          id: `prediction-${order.id}`,
          timestamp: order.timestamp,
          renderItem: () => (
            <MobilePredictionOrderCard state={state} order={order} />
          ),
        }));
  const predictionOnly = instrument === "prediction";
  const perpsOrderCount =
    (orderListState.dataSource as unknown[] | undefined)?.length ?? 0;
  const perpsCancelAll = orderListState.onCancelAll as () => void;
  const perpsStatusOptions = [
    { label: t("common.status.all"), value: "all" },
    { label: t("orders.status.pending"), value: "pending" },
    { label: t("orders.status.filled"), value: "filled" },
    { label: t("orders.status.partialFilled"), value: "partialFilled" },
    { label: t("orders.status.canceled"), value: "cancelled" },
    { label: t("orders.status.rejected"), value: "rejected" },
  ];
  const perpsOnFilter = orderListState.onFilter as (filter: {
    name: string;
    value: unknown;
  }) => void;
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
    // The outcome select is hidden outside the prediction-only view; reset
    // it so it cannot silently filter the merged list with no visible
    // control to change it back.
    if (filter.value !== "prediction" && filters.outcome !== "all") {
      filters.onFilter({ name: "outcome", value: "all" });
    }
    onProductFilter(filter);
  };
  // Single Cancel All whose scope follows the instrument filter; All cancels
  // both products. Perps keeps its confirm dialog while the prediction
  // cancel-all stays immediate, matching each side's behavior elsewhere.
  const predictionCancellable =
    state.openOrders.length > 0 && !state.isRegionRestricted;
  const cancelAllDisabled =
    instrument === "perps"
      ? perpsOrderCount === 0
      : instrument === "prediction"
        ? !predictionCancellable
        : perpsOrderCount === 0 && !predictionCancellable;
  const onCancelAllClick =
    instrument === "perps"
      ? perpsCancelAll
      : instrument === "prediction"
        ? state.cancelAllOrders
        : () => {
            if (perpsOrderCount > 0) perpsCancelAll();
            if (predictionCancellable) state.cancelAllOrders();
          };

  return (
    <div className="oui-w-full">
      <PredictionFilters
        filters={filters}
        mode={mode}
        leadingItems={productFilterItems}
        onLeadingFilter={onMobileProductFilter}
        onFilter={onSharedFilter}
        showOutcome={predictionOnly}
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
          {...(orderListState as React.ComponentProps<typeof MobileOrderList>)}
          dataSource={
            predictionOnly
              ? []
              : (orderListState.dataSource as React.ComponentProps<
                  typeof MobileOrderList
                >["dataSource"])
          }
          isLoading={predictionOnly ? false : Boolean(orderListState.isLoading)}
          loadMore={
            predictionOnly
              ? () => undefined
              : (orderListState.loadMore as () => void)
          }
          supplementalRows={supplementalRows}
          showFilter={false}
          classNames={{
            root: "oui-w-full oui-hide-scrollbar",
            content: "!oui-space-y-2 oui-p-2",
            cell: "oui-rounded-xl oui-bg-base-9 oui-p-3",
          }}
        />
      )}
    </div>
  );
};
