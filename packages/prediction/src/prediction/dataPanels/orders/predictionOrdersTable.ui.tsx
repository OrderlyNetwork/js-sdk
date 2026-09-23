import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import {
  adaptColumnsForSupplementalRows,
  TabType,
  useOrderColumn,
} from "@orderly.network/ui-orders";
import type { PredictionState } from "../../prediction.script";
import { PredictionFilters } from "../filters/predictionFilters.ui";
import { PredictionDataTable, tableColumn } from "../table";
import { PredictionOrderCell } from "./predictionOrderCell.ui";
import type {
  PredictionOrdersTableMode,
  PredictionOrdersTableScript,
} from "./predictionOrdersTable.script";

export type PredictionOrdersTableUIProps = {
  state: PredictionState;
  mode: PredictionOrdersTableMode;
  filters: PredictionOrdersTableScript["filters"];
  status?: "cancelled" | "unsupported";
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
};

export const PredictionOrdersTableUI = ({
  state,
  mode,
  filters,
  status,
  leadingFilterItems,
  onLeadingFilter,
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
  const records = pending
    ? state.openOrders
    : mode === "filled"
      ? state.history.filter((order) => order.status === "filled")
      : [...state.openOrders, ...state.history];
  return (
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
                disabled={!state.openOrders.length || state.isRegionRestricted}
                onClick={state.cancelAllOrders}
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
        .filter((order) =>
          filters.matches({
            ...order,
            status: "status" in order ? String(order.status) : "pending",
          }),
        )
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
    />
  );
};
