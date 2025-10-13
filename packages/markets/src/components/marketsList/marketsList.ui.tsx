import { FC } from "react";
import { cn, DataTable } from "@kodiak-finance/orderly-ui";
import { CollapseMarkets } from "../collapseMarkets";
import { useMarketsContext } from "../marketsProvider";
import { useSideMarketsColumns } from "../sideMarkets/column";
import { type MarketsListScriiptReturn } from "./marketsList.script";
import { type MarketsListWidgetProps } from "./marketsList.widget";

export type MarketsListProps = MarketsListScriiptReturn &
  Pick<
    MarketsListWidgetProps,
    | "getColumns"
    | "panelSize"
    | "tableClassNames"
    | "rowClassName"
    | "initialSort"
    | "renderHeader"
    | "emptyView"
  >;

export const MarketsList: FC<MarketsListProps> = (props) => {
  const {
    loading,
    dataSource,
    favorite,
    onSort,
    initialSort,
    getColumns,
    panelSize,
    isFavoritesList,
    renderHeader,
    emptyView,
  } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const sideColumns = useSideMarketsColumns(favorite, isFavoritesList);

  const columns =
    typeof getColumns === "function"
      ? getColumns(favorite, isFavoritesList)
      : sideColumns;

  if (panelSize === "small") {
    return null;
  }

  if (panelSize === "middle") {
    return <CollapseMarkets dataSource={dataSource} />;
  }

  return (
    <>
      {renderHeader?.(favorite)}
      <DataTable
        classNames={{
          root: props.tableClassNames?.root,
          body: props.tableClassNames?.body,
          header: cn("oui-h-9", props.tableClassNames?.header),
          scroll: props.tableClassNames?.scroll,
          empty: "oui-items-start oui-mt-6",
        }}
        columns={columns}
        loading={loading}
        dataSource={dataSource}
        onRow={(record) => {
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
        initialSort={
          initialSort
            ? { sortKey: initialSort.sortKey, sort: initialSort.sortOrder }
            : undefined
        }
        manualSorting
        emptyView={emptyView}
      />
    </>
  );
};
