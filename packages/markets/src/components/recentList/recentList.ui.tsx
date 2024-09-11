import { FC } from "react";
import { cn, DataTable } from "@orderly.network/ui";
import { UseRecentListReturn } from "./recentList.script";
import { useMarketsContext } from "../marketsProvider";
import { useRecentListColumns } from "./column";

export type RecentListProps = UseRecentListReturn;

export const RecentList: FC<RecentListProps> = (props) => {
  const { dataSource, favorite, onSort, loading } = props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useRecentListColumns(favorite);

  return (
    <DataTable
      classNames={{
        header: "oui-text-base-contrast-36",
        body: "oui-text-base-contrast-80",
      }}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      onRow={(record, index) => {
        return {
          className: cn(
            "group",
            "oui-h-[53px] oui-border-none oui-rounded-[6px]"
          ),
          onClick: () => {
            onSymbolChange?.(record);
            favorite.addToHistory(record);
          },
        };
      }}
      generatedRowKey={(record) => record.symbol}
      onSort={onSort}
      bordered={false}
    />
  );
};
