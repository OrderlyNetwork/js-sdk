import { useTranslation } from "@orderly.network/i18n";
import type { API } from "@orderly.network/types";
import { Button } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import {
  adaptColumnsForSupplementalRows,
  TabType,
  useOrderColumn,
} from "@orderly.network/ui-orders";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { PredictionFilters } from "../filters/predictionFilters.ui";
import { PredictionDataTable, tableColumn } from "../table";
import { PredictionOrderCell } from "./predictionOrderCell.ui";
import type {
  PredictionOrdersTableMode,
  PredictionOrdersTableScript,
} from "./predictionOrdersTable.script";

export type PredictionOrdersTableUIProps = {
  state: PredictionAccountPanelState;
  mode: PredictionOrdersTableMode;
  filters: PredictionOrdersTableScript["filters"];
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
  orders: API.Order[];
  totalCount?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  predictionUnderlyingSymbol?: string;
  cancelAllDisabled?: boolean;
  onCancelAll?: () => Promise<boolean>;
};

export const PredictionOrdersTableUI = ({
  state,
  mode,
  filters,
  leadingFilterItems,
  onLeadingFilter,
  orders,
  totalCount,
  onPageChange,
  loading,
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
  const resetKey = [
    state.accountId,
    filters.side,
    filters.status,
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
        rows={orders.map((order) => ({
          id: String(order.order_id),
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
        preservePageOnDataChange
        loading={loading}
        resetKey={resetKey}
      />
    </div>
  );
};
