import { useTranslation } from "@orderly.network/i18n";
import { Button } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import {
  adaptColumnsForSupplementalRows,
  TabType,
  useOrderColumn,
} from "@orderly.network/ui-orders";
import type { PredictionAccountPanelState } from "../../prediction.types";
import type {
  PredictionOpenOrder,
  PredictionTrade,
} from "../../prediction.types";
import { PredictionFilters } from "../filters/predictionFilters.ui";
import { PredictionDataTable, tableColumn } from "../table";
import { matchesPredictionOrderFilters } from "./matchesPredictionOrderFilters";
import { PredictionOrderCell } from "./predictionOrderCell.ui";
import type {
  PredictionOrdersTableMode,
  PredictionOrdersTableScript,
} from "./predictionOrdersTable.script";

export type PredictionOrdersTableUIProps = {
  state: PredictionAccountPanelState;
  mode: PredictionOrdersTableMode;
  filters: PredictionOrdersTableScript["filters"];
  status?: "cancelled" | "unsupported";
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
  orders?: (PredictionOpenOrder | PredictionTrade)[];
  totalCount?: number;
  onPageChange?: (page: number) => void;
  hasMore?: boolean;
  loadMore?: () => void;
  predictionUnderlyingSymbol?: string;
  cancelAllDisabled?: boolean;
  onCancelAll?: () => Promise<boolean>;
};

export const PredictionOrdersTableUI = ({
  state,
  mode,
  filters,
  status,
  leadingFilterItems,
  onLeadingFilter,
  orders,
  totalCount,
  onPageChange,
  hasMore,
  loadMore,
  predictionUnderlyingSymbol,
  cancelAllDisabled = true,
  onCancelAll,
}: PredictionOrdersTableUIProps) => {
  const { t } = useTranslation();
  const pending = mode === "pending";
  const baseOrderColumns = useOrderColumn({
    _type: pending
      ? TabType.pending
      : mode === "filled"
        ? TabType.filled
        : TabType.all,
  });
  // Rows here render through PredictionOrderCell by field — the same shape as
  // DesktopOrderList supplemental rows — so reuse that column layout.
  const orderColumns = adaptColumnsForSupplementalRows(baseOrderColumns);
  // "Filled" means "has executions", not terminal FILLED: MARKET submits a
  // protected-price IOC whose unfilled remainder terminates the order as
  // CANCELLED, so filtering by status === "filled" would hide executed records
  // (manual QA case: a partial-fill market order must keep its fill visible).
  const records =
    orders ??
    (pending
      ? state.openOrders
      : mode === "filled"
        ? state.history.filter((order) => order.filledQuantity > 0)
        : [...state.openOrders, ...state.history]);
  const resetKey = [
    filters.side,
    filters.status,
    filters.outcome,
    filters.dateRange?.from?.getTime(),
    filters.dateRange?.to?.getTime(),
    predictionUnderlyingSymbol,
  ].join(":");
  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col">
      <PredictionDataTable
        columns={orderColumns.map((column) =>
          tableColumn(column.title, Number(column.width ?? 130), {
            fixed:
              column.fixed === "left"
                ? "start"
                : column.fixed === "right"
                  ? "end"
                  : column.fixed,
            align: column.align,
            type: column.type === "action" ? "action" : "data",
          }),
        )}
        toolbar={
          <PredictionFilters
            filters={filters}
            mode={mode}
            leadingItems={leadingFilterItems}
            onLeadingFilter={onLeadingFilter}
            trailing={
              pending ? (
                <Button
                  size="xs"
                  variant="outlined"
                  color="secondary"
                  disabled={cancelAllDisabled}
                  onClick={onCancelAll}
                >
                  {t("orders.cancelAll")}
                </Button>
              ) : undefined
            }
          />
        }
        rows={records
          .filter(
            (order) =>
              !status ||
              (status === "cancelled" &&
                "status" in order &&
                order.status === "cancelled"),
          )
          .filter((order) => matchesPredictionOrderFilters(filters, order))
          .map((order) => ({
            id: String(order.id),
            cells: orderColumns.map((column) => (
              <PredictionOrderCell
                key={String(column.dataIndex)}
                state={state}
                order={order}
                field={String(column.dataIndex)}
              />
            )),
          }))}
        totalCount={totalCount}
        onPageChange={onPageChange}
        preservePageOnDataChange={Boolean(orders)}
        resetKey={resetKey}
      />
      {hasMore && (filters.outcome !== "all" || totalCount == null) && (
        <Button size="sm" variant="outlined" onClick={loadMore}>
          {t("orders.loadMore")}
        </Button>
      )}
    </div>
  );
};
