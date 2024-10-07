import { FC, useMemo } from "react";
import { cn } from "@orderly.network/ui";
import { type UseMarketsListReturn } from "./marketsList.script";
import { GetColumns, TInitialSort } from "../../type";
import { useMarketsContext } from "../marketsProvider";
import DataTable from "../dataTable";
import { getSideMarketsColumns } from "../sideMarkets/column";
import { CollapseMarkets } from "../collapseMarkets";

export type MarketsListProps = UseMarketsListReturn & {
  initialSort: TInitialSort;
  getColumns?: GetColumns;
  collapsed?: boolean;
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
    <DataTable
      classNames={{
        body: "oui-pb-[53px]",
      }}
      columns={columns}
      loading={loading}
      dataSource={dataSource}
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
      initialSort={initialSort}
    />
  );
};
