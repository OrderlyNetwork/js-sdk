import { FC } from "react";
import { cn, DataTable } from "@orderly.network/ui";
import { type UseMarketsListFullReturn } from "./marketsListFull.script";
import { TInitialSort } from "../../type";
import { useMarketsContext } from "../../components/marketsProvider";
import { useMarketsListFullColumns } from "./column";

export type MarketsListFullProps = UseMarketsListFullReturn & {
  initialSort: TInitialSort;
  type?: "all" | "new";
};

export const MarketsListFull: FC<MarketsListFullProps> = (props) => {
  const {
    loading,
    dataSource,
    meta,
    setPage,
    setPageSize,
    favorite,
    onSort,
    initialSort,
    type,
    pagination,
  } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const columns = useMarketsListFullColumns(favorite, false);

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
            type === "new" ? "newListing" : "all"
          }-tr-${record.symbol}`,
        };
      }}
      generatedRowKey={(record) => record.symbol}
      rowSelection={{ [symbol!]: true }}
      onSort={onSort}
      initialSort={initialSort}
      pagination={pagination}
      classNames={{
        header: "oui-h-12",
      }}
      manualPagination
      manualSorting
    />
  );
};
