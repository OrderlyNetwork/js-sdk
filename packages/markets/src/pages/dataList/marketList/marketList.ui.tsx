import { FC } from "react";
import { DataTable, Pagination } from "@orderly.network/ui";
import { useMarketListColumns } from "./column";
import { type UseMarketListReturn } from "./marketList.script";

type MarketListProps = {} & UseMarketListReturn;

export const MarketList: FC<MarketListProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize } = props;
  const columns = useMarketListColumns();

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
        return { className: "oui-h-[55px] oui-border-line-12" };
      }}
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
