import { FC } from "react";
import { cn, DataTable, Pagination } from "@orderly.network/ui";
import { type UseMarketListReturn } from "./marketList.script";
import { useDataListColumns } from "../column";

type MarketListProps = UseMarketListReturn;

export const MarketList: FC<MarketListProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize, favorite, onSort } = props;
  const columns = useDataListColumns(favorite, false);

  return (
    <DataTable
      bordered
      classNames={{
        // root: "oui-bg-base-900",
        header: "oui-text-base-contrast-36",
        body: "oui-text-base-contrast-80",
      }}
      columns={columns}
      dataSource={dataSource}
      onRow={(record, index) => {
        return {
          className: cn(
            "group",
            "oui-h-[55px] oui-border-line-4 oui-cursor-pointer",
            "oui-bg-base-9 hover:oui-bg-base-8"
          ),
        };
      }}
      generatedRowKey={(record) => record.symbol}
      onSort={onSort}
    >
      <Pagination
        {...meta}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        // className="oui-flex oui-justify-between"
      />
    </DataTable>
  );
};
