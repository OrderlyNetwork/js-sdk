import { FC, ReactNode } from "react";
import { Trans } from "@orderly.network/i18n";
import { cn, Flex, DataTable } from "@orderly.network/ui";
import { FavoritesTabWidget } from "../../components/favoritesTabs";
import { useMarketsContext } from "../../components/marketsProvider";
import { UnFavoritesIcon } from "../../icons";
import { useMarketsListFullColumns } from "../marketsListFull/column";
import { UseFavoritesListFullReturn } from "./favoritesListFull.script";

export type FavoritesListFullProps = UseFavoritesListFullReturn & {
  emptyView?: ReactNode;
};

export const FavoritesListFull: FC<FavoritesListFullProps> = (props) => {
  const { dataSource, favorite, onSort, loading, pagination } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const columns = useMarketsListFullColumns(favorite, true);

  const emptyView = props.emptyView || (
    <Flex className="oui-text-xs oui-text-base-contrast-36">
      {/* @ts-ignore */}
      <Trans
        i18nKey="markets.dataList.favorites.empty"
        components={[
          <UnFavoritesIcon key="0" className="oui-text-base-contrast-36" />,
        ]}
      />
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
