import { FC } from "react";
import { cn, Flex, Text, DataTable } from "@orderly.network/ui";
import { UnFavoritesIcon } from "../../icons";
import { UseFavoritesListFullReturn } from "./favoritesListFull.script";
import { useMarketsContext } from "../../components/marketsProvider";
import { FavoritesTabWidget } from "../../components/favoritesTabs";
import { useFavoritesListFullColumns } from "./column";
import { Trans } from "@orderly.network/i18n";

export type FavoritesListFullProps = UseFavoritesListFullReturn;

export const FavoritesListFull: FC<FavoritesListFullProps> = (props) => {
  const { dataSource, favorite, onSort, loading, pagination } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const columns = useFavoritesListFullColumns(favorite, true);

  const emptyView = (
    <Flex className="oui-text-xs oui-text-base-contrast-36">
      {/* @ts-ignore */}
      <Trans i18nKey="markets.dataList.favorites.empty">
        Click on the
        <UnFavoritesIcon className="oui-text-base-contrast-36" />
        icon next to a market to add it to your list.
      </Trans>
    </Flex>
  );

  return (
    <div>
      <FavoritesTabWidget favorite={favorite} className="oui-my-3" />

      <DataTable
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
        manualSorting
      />
    </div>
  );
};
