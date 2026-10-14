import React, { useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderStatus } from "@orderly.network/types";
import { Button } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import { DesktopOrderList } from "@orderly.network/ui-orders";
import { binaryOrderPlainText } from "../binary/binaryOrderPlainText";
import type { PredictionAccountPanelState } from "../prediction.types";
import { usePredictionFilters } from "../predictionFilters.script";
import { matchesPredictionOrderFilters } from "./orders/matchesPredictionOrderFilters";
import { PredictionOrderCell } from "./orders/predictionOrderCell.ui";
import { PredictionOrdersTable } from "./orders/predictionOrdersTable.widget";
import type { PredictionPerpsPanelProps } from "./perpsPanel.types";
import { shouldLoadMoreProductOrders } from "./productOrderPagination";
import {
  buildProductFilterItems,
  toPredictionSide,
  toPredictionStatus,
  useAllProductOrdersTableScript,
  useSharedProductOrdersPanelScript,
  type ProductOrderMode,
} from "./sharedProductOrdersPanel.script";
import { useScopedPredictionAccount } from "./useScopedPredictionAccount";

const AllProductOrdersTable: React.FC<
  PredictionPerpsPanelProps & {
    state: PredictionAccountPanelState;
    mode: ProductOrderMode;
    includePrediction: boolean;
    productFilterItems: DataFilterItem[];
    onProductFilter: (filter: { name: string; value: unknown }) => void;
    perpsSymbol?: string;
    predictionUnderlyingSymbol?: string;
  }
> = ({
  state,
  mode,
  includePrediction,
  productFilterItems,
  onProductFilter,
  perpsSymbol,
  predictionUnderlyingSymbol,
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
}) => {
  const { t } = useTranslation();
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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
    onSymbolChange,
    sharePnLConfig,
    pnlNotionalDecimalPrecision,
  });
  const filters = usePredictionFilters(mode === "history");
  const perpsOnFilter = orderListState.onFilter;
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

  const perpsLoaded = orderListState.dataSource?.length ?? 0;
  useEffect(() => {
    if (!includePrediction || predictionUnderlyingSymbol) return;
    if (
      shouldLoadMoreProductOrders({
        loaded: perpsLoaded,
        page: requestedPage,
        pageSize,
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
        pageSize,
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
    pageSize,
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
        {...orderListState}
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
        mergedPageSize={pageSize}
        onMergedPageSizeChange={(size) => {
          setPageSize(size);
          setRequestedPage(1);
        }}
        mergeResetKey={[
          mode,
          perpsSymbol,
          predictionUnderlyingSymbol,
          orderListState.orderStatus,
          orderListState.ordersSide,
          orderListState.dateRange?.from?.getTime(),
          orderListState.dateRange?.to?.getTime(),
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
                  status:
                    order.status === "cancelled"
                      ? OrderStatus.CANCELLED
                      : undefined,
                  plainText: (field) => binaryOrderPlainText(order, field),
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

export interface SharedProductOrdersPanelProps extends PredictionPerpsPanelProps {
  state: PredictionAccountPanelState;
  mode: ProductOrderMode;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
}

export const SharedProductOrdersPanel: React.FC<
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
  const { instrument, onProductFilter } = useSharedProductOrdersPanelScript();
  const productFilterItems: DataFilterItem[] = buildProductFilterItems(
    t,
    instrument,
  );

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
        onSymbolChange={onSymbolChange}
        sharePnLConfig={sharePnLConfig}
        pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
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
