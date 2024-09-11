import { FC } from "react";
import { Box, cn, DataTable } from "@orderly.network/ui";
import { UseFavoritesListReturn } from "./favoritesList.script";
import { useMarketsContext } from "../marketsProvider";
import { FavoritesTabWidget } from "../favoritesTabs";
import { useFavoritesListColumns } from "./column";

export type FavoritesListProps = UseFavoritesListReturn;

export const FavoritesList: FC<FavoritesListProps> = (props) => {
  const { dataSource, favorite, onSort, loading } = props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useFavoritesListColumns(favorite, true);

  return (
    <div>
      <Box px={3}>
        <FavoritesTabWidget favorite={favorite} size="sm" />
      </Box>

      <DataTable
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80",
        }}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        onRow={(record, index) => {
          return {
            className: cn(
              "group",
              "oui-h-[53px] oui-border-none oui-rounded-[6px]"
            ),
            onClick: () => {
              onSymbolChange?.(record);
              favorite.addToHistory(record);
            },
          };
        }}
        generatedRowKey={(record) => record.symbol}
        onSort={onSort}
        bordered={false}
      />
    </div>
  );
};
