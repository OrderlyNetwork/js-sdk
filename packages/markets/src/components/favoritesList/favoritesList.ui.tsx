import { FC, useMemo } from "react";
import { Box, cn, TableView } from "@orderly.network/ui";
import { UseFavoritesListReturn } from "./favoritesList.script";
import { useMarketsContext } from "../marketsProvider";
import { FavoritesTabWidget } from "../favoritesTabs";
import { getSideMarketsColumns } from "../sideMarkets/column";
import type { FavoritesListWidgetProps } from "./widget";
import { CollapseMarkets } from "../collapseMarkets";

export type FavoritesListProps = UseFavoritesListReturn &
  FavoritesListWidgetProps;

export const FavoritesList: FC<FavoritesListProps> = (props) => {
  const { dataSource, favorite, onSort, loading, getColumns, collapsed } =
    props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const columns = useMemo(() => {
    return typeof getColumns === "function"
      ? getColumns(favorite, true)
      : getSideMarketsColumns(favorite, true);
  }, [favorite]);

  if (collapsed) {
    return <CollapseMarkets dataSource={dataSource} />;
  }

  return (
    <>
      <Box px={3} className="oui-my-[6px]">
        <FavoritesTabWidget favorite={favorite} size="sm" />
      </Box>

      <TableView
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
    </>
  );
};
