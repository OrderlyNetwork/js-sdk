import { FC } from "react";
import { cn, DataTable, Pagination } from "@orderly.network/ui";
import { type UseMarketListReturn } from "./marketList.script";
import { useDataListColumns } from "../column";
import { TInitialSort } from "../../../../type";
import { useMarketsContext } from "../../provider";

type MarketListProps = UseMarketListReturn & {
  initialSort: TInitialSort;
};

export const MarketList: FC<MarketListProps> = (props) => {
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

  const columns = useDataListColumns(favorite, false);

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
