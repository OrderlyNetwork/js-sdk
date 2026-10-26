import React, { useEffect, useMemo } from "react";
import { cn, TableFeatures, usePagination } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import type { PredictionTableColumn, PredictionTableRow } from "./tableColumn";

export const PredictionDataTable: React.FC<{
  columns: PredictionTableColumn[];
  rows: PredictionTableRow[];
  toolbar?: React.ReactNode;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  preservePageOnDataChange?: boolean;
  resetKey?: string;
  groups?: Array<{ id: string; label: React.ReactNode }>;
  loading?: boolean;
}> = ({
  columns,
  rows,
  toolbar,
  totalCount,
  onPageChange,
  preservePageOnDataChange,
  resetKey,
  groups,
  loading,
}) => {
  // Perp parity: 20 rows per page, matching the merged DesktopOrderList view.
  const { pagination, setPage } = usePagination({ pageSize: 20 });
  const dataColumns = useMemo<Column<PredictionTableRow>[]>(
    () =>
      columns.map((column, index) => ({
        title: column.title,
        plantTextTitle:
          typeof column.title === "string" ? column.title : undefined,
        dataIndex: `cell_${index}`,
        width: column.width,
        align: column.align ?? "left",
        fixed: column.fixed,
        type: column.type,
        onSort: column.sortable,
        render: (_value, record) => record.cells[index],
        renderPlantText: (_value, record) =>
          String(record.sortValues?.[index] ?? ""),
      })),
    [columns],
  );

  const dataSource = useMemo(
    () =>
      rows.map((row) =>
        row.cells.reduce<PredictionTableRow>(
          (record, cell, index) => {
            record[`cell_${index}`] = row.sortValues?.[index] ?? cell;
            return record;
          },
          { ...row },
        ),
      ),
    [rows],
  );
  const groupedRows = useMemo(
    () =>
      new Map(
        (groups ?? []).map((group) => [
          group.id,
          dataSource.filter((row) => row.groupId === group.id),
        ]),
      ),
    [groups, dataSource],
  );
  const tableRows = groups
    ? groups
        .filter((group) => groupedRows.get(group.id)?.length)
        .map((group) => ({ id: group.id, cells: [group.label] }))
    : dataSource;

  useEffect(() => {
    if (!preservePageOnDataChange) setPage(1);
  }, [dataSource.length, setPage, preservePageOnDataChange]);

  useEffect(() => {
    setPage(1);
  }, [resetKey, setPage]);

  // Always hand pagination to the table: the DataTable hides the bar itself
  // when there are no rows (useShowPagination), so empty and auth states stay
  // clean without a local row-count threshold.
  const tablePagination = {
    ...pagination,
    pageSize: 20,
    count: totalCount ?? dataSource.length,
    onPageChange: (page: number) => {
      setPage(page);
      onPageChange?.(page);
    },
  };

  // Perp parity (DesktopOrderList): toolbar sits above the table; the table
  // root is height-constrained so DataTable's internal `overflow-auto` scroll
  // area owns both axes. Column widths drive horizontal scroll + fixed pins.
  return (
    <div className="oui-prediction-dataTable-container oui-flex oui-size-full oui-min-h-0 oui-flex-col">
      {toolbar}
      <AuthGuardDataTable
        className="oui-prediction-dataTable"
        columns={dataColumns}
        dataSource={tableRows}
        loading={loading}
        expanded={groups ? true : undefined}
        getSubRows={groups ? (row) => groupedRows.get(row.id) : undefined}
        onCell={
          groups
            ? (column, record) =>
                groupedRows.has(record.id)
                  ? {
                      children: column.id === "cell_0" ? record.cells[0] : null,
                    }
                  : undefined
            : undefined
        }
        bordered
        ignoreLoadingCheck
        classNames={{
          header: "oui-h-[38px]",
          root: cn(
            "oui-items-start",
            toolbar ? "!oui-h-[calc(100%_-_49px)]" : "oui-h-full",
          ),
        }}
        onRow={() => ({
          className: "oui-h-12 oui-text-base-contrast-80",
        })}
        generatedRowKey={(record) => record.id}
        pagination={tablePagination}
        features={[TableFeatures.DownloadFeature]}
      />
    </div>
  );
};
