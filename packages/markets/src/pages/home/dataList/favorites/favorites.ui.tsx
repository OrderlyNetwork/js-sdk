import { FC } from "react";
import { cn, DataTable, Flex, Pagination, Text } from "@orderly.network/ui";
import { useDataListColumns } from "../column";
import { UnFavoritesIcon } from "../../../../icons";
import { UseFavoritesReturn } from "./favorites.script";
import { useMarketsContext } from "../../provider";
import { FavoritesTabWidget } from "../../../../components/favoritesTabs";

type FavoritesProps = {} & UseFavoritesReturn;

export const Favorites: FC<FavoritesProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize, favorite, onSort, loading } =
    props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useDataListColumns(favorite, true);

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
