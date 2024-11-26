import { FC, useMemo } from "react";
import { cn, TableView, TableViewClassNames } from "@orderly.network/ui";
import { type UseMarketsListReturn } from "./marketsList.script";
import { GetColumns, TInitialSort } from "../../type";
import { useMarketsContext } from "../marketsProvider";
import { getSideMarketsColumns } from "../sideMarkets/column";
import { CollapseMarkets } from "../collapseMarkets";

export type MarketsListProps = UseMarketsListReturn & {
  initialSort: TInitialSort;
  getColumns?: GetColumns;
  collapsed?: boolean;
  tableClassNames?: TableViewClassNames;
  rowClassName?: string;
};

export const MarketsList: FC<MarketsListProps> = (props) => {
  const {
    loading,
    dataSource,
    favorite,
    onSort,
    initialSort,
    getColumns,
    collapsed,
  } = props;

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
    <TableView
      classNames={{
        root: props.tableClassNames?.root,
        body: props.tableClassNames?.body,
        header: cn("oui-h-9", props.tableClassNames?.header),
        scroll: props.tableClassNames?.scroll,
      }}
      columns={columns}
      loading={loading}
      dataSource={dataSource}
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
      initialSort={initialSort}
      manualSorting
    />
  );
};
