import { FC } from "react";
import { cn, DataTable, type DataTableClassNames } from "@orderly.network/ui";
import { useMarketsContext } from "../marketsProvider";
import { desktopMarketsTableClassName } from "../shared/desktopMarketsTable";
import { LowVolumeEmptyView } from "../shared/lowVolumeEmptyView";
import { useMarketsListFullColumns } from "./column";
import {
  type MarketsListFullType,
  type UseMarketsListFullReturn,
} from "./marketsListFull.script";

export type MarketsListFullProps = UseMarketsListFullReturn & {
  type?: MarketsListFullType;
  hideEmptyTable?: boolean;
  tableClassNames?: DataTableClassNames;
};

export const MarketsListFull: FC<MarketsListFullProps> = (props) => {
  const {
    loading,
    dataSource,
    isHiddenByLowVolumeFilter,
    favorite,
    onSort,
    initialSort,
    type,
    pagination,
  } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const columns = useMarketsListFullColumns(favorite, false);

  if (props.hideEmptyTable && !loading && !dataSource?.length) {
    return null;
  }

  return (
    <DataTable
      bordered
      columns={columns}
      loading={loading}
      dataSource={dataSource}
      onRow={(record, index) => {
        return {
          className: cn("oui-h-[55px] oui-cursor-pointer"),
          onClick: () => {
            onSymbolChange?.(record);
            favorite.addToHistory(record);
          },
          "data-testid": `oui-testid-markets-${
            type === "new"
              ? "newListing"
              : type === "rwa"
                ? "rwa"
                : type === "preTge"
                  ? "preTge"
                  : "all"
          }-tr-${record.symbol}`,
        };
      }}
      generatedRowKey={(record) => record.symbol}
      rowSelection={{ [symbol!]: true }}
      onSort={onSort}
      initialSort={initialSort}
      pagination={pagination}
      classNames={{
        ...props.tableClassNames,
        root: cn(desktopMarketsTableClassName, props.tableClassNames?.root),
        header: "oui-h-12",
        empty: isHiddenByLowVolumeFilter
          ? "oui-items-start oui-pt-16"
          : undefined,
      }}
      manualSorting
      emptyView={isHiddenByLowVolumeFilter ? <LowVolumeEmptyView /> : undefined}
    />
  );
};
