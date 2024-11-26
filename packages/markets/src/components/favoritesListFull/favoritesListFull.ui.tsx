import { FC } from "react";
import { cn, Flex, Text, TableView } from "@orderly.network/ui";
import { UnFavoritesIcon } from "../../icons";
import { UseFavoritesListFullReturn } from "./favoritesListFull.script";
import { useMarketsContext } from "../../components/marketsProvider";
import { FavoritesTabWidget } from "../../components/favoritesTabs";
import { useFavoritesListFullColumns } from "./column";

export type FavoritesListFullProps = UseFavoritesListFullReturn;

export const FavoritesListFull: FC<FavoritesListFullProps> = (props) => {
  const {
    dataSource,
    meta,
    setPage,
    setPageSize,
    favorite,
    onSort,
    loading,
    pagination,
  } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const columns = useFavoritesListFullColumns(favorite, true);

  const emptyView = (
    <Flex>
      <Text size="xs" intensity={36}>
        Click on the
      </Text>
      <UnFavoritesIcon className="oui-text-base-contrast-36" />
      <Text size="xs" intensity={36}>
        icon next to a market to add it to your list.
      </Text>
    </Flex>
  );

  return (
    <div>
      <FavoritesTabWidget favorite={favorite} className="oui-my-3" />

      <TableView
        bordered
        // minHeight={187.5}
        columns={columns}
        dataSource={dataSource}
        emptyView={emptyView}
        loading={loading}
        onRow={(record, index) => {
          return {
            className: cn("oui-h-[55px] oui-cursor-pointer"),
            onClick: () => {
              onSymbolChange?.(record);
              favorite.addToHistory(record);
            },
          };
        }}
        generatedRowKey={(record) => record.symbol}
        rowSelection={{ [symbol!]: true }}
        onSort={onSort}
        pagination={pagination}
        manualPagination
        manualSorting
      />
    </div>
  );
};
