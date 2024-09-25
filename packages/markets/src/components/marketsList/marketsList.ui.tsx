import { FC, useMemo } from "react";
import { cn } from "@orderly.network/ui";
import { type UseMarketsListReturn } from "./marketsList.script";
import { GetColumns, TInitialSort } from "../../type";
import { useMarketsContext } from "../marketsProvider";
import Table from "../Table";
import { getSideMarketsColumns } from "../sideMarkets/column";

export type MarketsListProps = UseMarketsListReturn & {
  initialSort: TInitialSort;
  getColumns?: GetColumns;
};

export const MarketsList: FC<MarketsListProps> = (props) => {
  const { loading, dataSource, favorite, onSort, initialSort, getColumns } =
    props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useMemo(() => {
    return typeof getColumns === "function"
      ? getColumns(favorite, false)
      : getSideMarketsColumns(favorite, false);
  }, [favorite]);

  return (
    <Table
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
