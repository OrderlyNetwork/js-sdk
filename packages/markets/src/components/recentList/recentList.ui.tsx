import { FC, useMemo } from "react";
import { cn, DataTable } from "@orderly.network/ui";
import { UseRecentListReturn } from "./recentList.script";
import { useMarketsContext } from "../marketsProvider";
import { getSideMarketsColumns } from "../sideMarkets/column";
import { RecentListWidgetProps } from "./widget";
import { CollapseMarkets } from "../collapseMarkets";

export type RecentListProps = UseRecentListReturn & RecentListWidgetProps;

export const RecentList: FC<RecentListProps> = (props) => {
  const { dataSource, favorite, onSort, loading, getColumns, collapsed } =
    props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const columns = useMemo(() => {
    return typeof getColumns === "function"
      ? getColumns(favorite, false)
      : getSideMarketsColumns(favorite, false);
  }, [favorite]);

  if (collapsed) {
    return <CollapseMarkets dataSource={dataSource} />;
  }

  return (
    <DataTable
      classNames={{
        root: props.tableClassNames?.root,
        body: props.tableClassNames?.body,
        header: cn("oui-h-9", props.tableClassNames?.header),
        scroll: props.tableClassNames?.scroll,
      }}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      onRow={(record, index) => {
        return {
          className: cn("oui-h-[53px]", props.rowClassName),
          onClick: () => {
            onSymbolChange?.(record);
            favorite.addToHistory(record);
          },
        };
      }}
      generatedRowKey={(record) => record.symbol}
      rowSelection={{ [symbol!]: true }}
      onSort={onSort}
      manualSorting
    />
  );
};
