import { FC, useMemo } from "react";
import { Box, cn } from "@orderly.network/ui";
import { UseFavoritesListReturn } from "./favoritesList.script";
import { useMarketsContext } from "../marketsProvider";
import { FavoritesTabWidget } from "../favoritesTabs";
import { getSideMarketsColumns } from "../sideMarkets/column";
import type { FavoritesListWidgetProps } from "./widget";
import Table from "../Table";

export type FavoritesListProps = UseFavoritesListReturn &
  FavoritesListWidgetProps;

export const FavoritesList: FC<FavoritesListProps> = (props) => {
  const { dataSource, favorite, onSort, loading, getColumns } = props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useMemo(() => {
    return typeof getColumns === "function"
      ? getColumns(favorite, true)
      : getSideMarketsColumns(favorite, true);
  }, [favorite]);

  return (
    <>
      <Box px={3}>
        <FavoritesTabWidget favorite={favorite} size="sm" />
      </Box>

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
    </>
  );
};
