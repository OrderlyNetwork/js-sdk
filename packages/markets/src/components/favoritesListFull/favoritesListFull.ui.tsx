import { FC } from "react";
import { cn, DataTable, Flex, Pagination, Text } from "@orderly.network/ui";
import { UnFavoritesIcon } from "../../icons";
import { UseFavoritesListFullReturn } from "./favoritesListFull.script";
import { useMarketsContext } from "../../components/marketsProvider";
import { FavoritesTabWidget } from "../../components/favoritesTabs";
import { useFavoritesListFullColumns } from "./column";

export type FavoritesListFullProps = UseFavoritesListFullReturn;

export const FavoritesListFull: FC<FavoritesListFullProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize, favorite, onSort, loading } =
    props;

  const { onSymbolChange } = useMarketsContext();

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
      <FavoritesTabWidget favorite={favorite} />

      <DataTable
        bordered
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80 !oui-min-h-[187.5px]",
        }}
        columns={columns}
        dataSource={dataSource}
        emptyView={emptyView}
        loading={loading}
        onRow={(record, index) => {
          return {
            className: cn(
              "group",
              "oui-h-[55px] oui-border-line-4 oui-cursor-pointer"
            ),
            onClick: () => {
              onSymbolChange?.(record);
            },
          };
        }}
        generatedRowKey={(record) => record.symbol}
        onSort={onSort}
      >
        <Pagination
          {...meta}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </DataTable>
    </div>
  );
};
