import { FC } from "react";
import { cn, DataTable } from "@orderly.network/ui";
import { useMarketsContext } from "../../components/marketsProvider";
import { useMarketsListFullColumns } from "./column";
import {
  type MarketsListFullType,
  type UseMarketsListFullReturn,
} from "./marketsListFull.script";

export type MarketsListFullProps = UseMarketsListFullReturn & {
  type?: MarketsListFullType;
};

export const MarketsListFull: FC<MarketsListFullProps> = (props) => {
  const {
    loading,
    dataSource,
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
            type === "new" ? "newListing" : type === "rwa" ? "rwa" : "all"
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
      manualSorting
    />
  );
};
