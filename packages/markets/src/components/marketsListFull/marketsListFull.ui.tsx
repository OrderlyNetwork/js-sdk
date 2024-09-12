import { FC } from "react";
import { cn, DataTable, Pagination } from "@orderly.network/ui";
import { type UseMarketsListFullReturn } from "./marketsListFull.script";
import { TInitialSort } from "../../type";
import { useMarketsContext } from "../../components/marketsProvider";
import { useMarketsListFullColumns } from "./column";

export type MarketsListFullProps = UseMarketsListFullReturn & {
  initialSort: TInitialSort;
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
  } = props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useMarketsListFullColumns(favorite, false);

  return (
    <DataTable
      bordered
      classNames={{
        header: "oui-text-base-contrast-36",
        body: "oui-text-base-contrast-80",
      }}
      columns={columns}
      loading={loading}
      dataSource={dataSource}
      onRow={(record, index) => {
        return {
          className: cn("oui-h-[55px] oui-border-line-4 oui-cursor-pointer"),
          onClick: () => {
            onSymbolChange?.(record);
            favorite.addToHistory(record);
          },
        };
      }}
      generatedRowKey={(record) => record.symbol}
      onSort={onSort}
      initialSort={initialSort}
    >
      <Pagination
        {...meta}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </DataTable>
  );
};
