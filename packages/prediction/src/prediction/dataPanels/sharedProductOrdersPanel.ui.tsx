import React, { useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import { DesktopOrderList } from "@orderly.network/ui-orders";
import type { PredictionAccountPanelState } from "../prediction.types";
import { usePredictionFilters } from "../predictionFilters.script";
import { matchesPredictionOrderFilters } from "./orders/matchesPredictionOrderFilters";
import { PredictionOrderCell } from "./orders/predictionOrderCell.ui";
import { PredictionOrdersTable } from "./orders/predictionOrdersTable.widget";
import { shouldLoadMoreProductOrders } from "./productOrderPagination";
import {
  toPredictionSide,
  toPredictionStatus,
  useAllProductOrdersTableScript,
  useSharedProductOrdersPanelScript,
  type ProductOrderMode,
} from "./sharedProductOrdersPanel.script";
import { useScopedPredictionAccount } from "./useScopedPredictionAccount";

const AllProductOrdersTable: React.FC<{
  state: PredictionAccountPanelState;
  mode: ProductOrderMode;
  includePrediction: boolean;
  productFilterItems: DataFilterItem[];
  onProductFilter: (filter: { name: string; value: unknown }) => void;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
}> = ({
  state,
  mode,
  includePrediction,
  productFilterItems,
  onProductFilter,
  perpsSymbol,
  predictionUnderlyingSymbol,
}) => {
  const { t } = useTranslation();
  const [requestedPage, setRequestedPage] = useState(1);
  const {
    orderListState,
    predictionOrders,
    binary,
    perpsTotal,
    perpsHasMore,
    loadMorePerps,
    cancelAllDisabled,
  } = useAllProductOrdersTableScript({
    state,
    mode,
    perpsSymbol,
    predictionUnderlyingSymbol,
    includePrediction,
  });
  const filters = usePredictionFilters(mode === "history");
  const perpsOnFilter = orderListState.onFilter as (filter: {
    name: string;
    value: unknown;
  }) => void;
  const onSharedFilter = (filter: { name: string; value: unknown }) => {
    setRequestedPage(1);
    perpsOnFilter(filter);
    if (filter.name === "side") {
      filters.onFilter({
        name: "side",
        value: toPredictionSide(filter.value),
      });
    } else if (filter.name === "status") {
      filters.onFilter({
        name: "status",
        value: toPredictionStatus(filter.value),
      });
    } else if (filter.name === "dateRange") {
      filters.onFilter(filter);
    }
  };

  const perpsLoaded =
    (orderListState.dataSource as unknown[] | undefined)?.length ?? 0;
  useEffect(() => {
    if (!includePrediction || predictionUnderlyingSymbol) return;
    if (
      shouldLoadMoreProductOrders({
        loaded: perpsLoaded,
        page: requestedPage,
        hasMore: perpsHasMore,
        isValidating: Boolean(orderListState.isValidating),
      })
    ) {
      loadMorePerps();
    }
    if (
      shouldLoadMoreProductOrders({
        loaded: predictionOrders.length,
        page: requestedPage,
        hasMore: binary.hasMore,
        isValidating: binary.isValidating,
      })
    ) {
      binary.loadMore();
    }
  }, [
    includePrediction,
    predictionUnderlyingSymbol,
    requestedPage,
    perpsHasMore,
    perpsLoaded,
    orderListState.isValidating,
    loadMorePerps,
    binary.hasMore,
    binary.isValidating,
    binary.loadMore,
    predictionOrders.length,
  ]);

  const loadMore = () => {
    if (perpsHasMore) loadMorePerps();
    if (binary.hasMore) binary.loadMore();
  };

  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col">
      <DesktopOrderList
        {...(orderListState as React.ComponentProps<typeof DesktopOrderList>)}
        onFilter={onSharedFilter}
        cancelAllDisabled={cancelAllDisabled}
        additionalFilterItems={productFilterItems}
        onAdditionalFilter={onProductFilter}
        mergeProducts={includePrediction}
        // Rows-based on both sides; binary.total is meta-based and shares the
        // WS cross-product leak, so the footer could exceed the rendered rows.
        mergedTotal={
          includePrediction && !predictionUnderlyingSymbol
            ? perpsTotal + predictionOrders.length
            : undefined
        }
        onMergedPageChange={setRequestedPage}
        mergeResetKey={[
          mode,
          perpsSymbol,
          predictionUnderlyingSymbol,
          orderListState.orderStatus,
          orderListState.ordersSide,
          (
            orderListState.dateRange as { from?: Date } | undefined
          )?.from?.getTime(),
          (
            orderListState.dateRange as { to?: Date } | undefined
          )?.to?.getTime(),
        ].join(":")}
        supplementalRows={
          includePrediction
            ? predictionOrders
                .filter((order) =>
                  matchesPredictionOrderFilters(filters, order),
                )
                .map((order) => ({
                  id: `prediction-${order.id}`,
                  timestamp: order.timestamp,
                  renderCell: (field) => (
                    <PredictionOrderCell
                      state={state}
                      order={order}
                      field={field}
                    />
                  ),
                }))
            : undefined
        }
      />
      {includePrediction &&
        predictionUnderlyingSymbol &&
        (perpsHasMore || binary.hasMore) && (
          <Button size="sm" variant="outlined" onClick={loadMore}>
            {t("orders.loadMore")}
          </Button>
        )}
    </div>
  );
};

export const SharedProductOrdersPanel: React.FC<{
  state: PredictionAccountPanelState;
  mode: ProductOrderMode;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
}> = ({ state, mode, perpsSymbol, predictionUnderlyingSymbol }) => {
  const { t } = useTranslation();
  const scopedState = useScopedPredictionAccount(
    state,
    predictionUnderlyingSymbol,
  );
  const { instrument, onProductFilter } = useSharedProductOrdersPanelScript();
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

  const content =
    instrument === "prediction" ? (
      <PredictionOrdersTable
        state={scopedState}
        mode={mode}
        leadingFilterItems={productFilterItems}
        onLeadingFilter={onProductFilter}
        predictionUnderlyingSymbol={predictionUnderlyingSymbol}
      />
    ) : (
      <AllProductOrdersTable
        state={scopedState}
        mode={mode}
        perpsSymbol={perpsSymbol}
        predictionUnderlyingSymbol={predictionUnderlyingSymbol}
        includePrediction={instrument === "all"}
        productFilterItems={productFilterItems}
        onProductFilter={onProductFilter}
      />
    );

  // Clip to the tab pane so only DataTable's internal scrollbar appears.
  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col oui-overflow-hidden">
      {content}
    </div>
  );
};
