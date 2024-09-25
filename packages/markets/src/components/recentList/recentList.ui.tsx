import { FC, useMemo } from "react";
import { cn } from "@orderly.network/ui";
import { UseRecentListReturn } from "./recentList.script";
import { useMarketsContext } from "../marketsProvider";
import Table from "../Table";
import { getSideMarketsColumns } from "../sideMarkets/column";
import { RecentListWidgetProps } from "./widget";
import { CollapseMarkets } from "../collapseMarkets";

export type RecentListProps = UseRecentListReturn & RecentListWidgetProps;

export const RecentList: FC<RecentListProps> = (props) => {
  const { dataSource, favorite, onSort, loading, getColumns, collapsed } =
    props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useMemo(() => {
    return typeof getColumns === "function"
      ? getColumns(favorite, false)
      : getSideMarketsColumns(favorite, false);
  }, [favorite]);

  if (collapsed) {
    return <CollapseMarkets dataSource={dataSource} />;
  }

  return (
    <Table
      classNames={{
        body: "oui-pb-[53px]",
      }}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      onRow={(record, index) => {
        return {
          className: cn("group", "oui-h-[53px]"),
          onClick: () => {
            onSymbolChange?.(record);
            favorite.addToHistory(record);
          },
        };
      }}
      generatedRowKey={(record) => record.symbol}
      onSort={onSort}
    />
  );
};
