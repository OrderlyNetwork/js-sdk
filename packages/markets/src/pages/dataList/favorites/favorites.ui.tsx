import { FC } from "react";
import { DataTable, Pagination } from "@orderly.network/ui";
import { useFavoritesColumns } from "./column";
import { type UseFavoritesReturn } from "./favorites.script";

type FavoritesProps = {} & UseFavoritesReturn;

export const Favorites: FC<FavoritesProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize } = props;
  const columns = useFavoritesColumns();

  return (
    <DataTable
      bordered
      classNames={{
        // root: "oui-bg-base-900",
        header: "oui-text-base-contrast-36",
        body: "oui-text-base-contrast-80",
      }}
      columns={columns}
      dataSource={dataSource}
      onRow={(record, index) => {
        return { className: "oui-h-[55px] oui-border-line-12" };
      }}
    >
      <Pagination
        {...meta}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        // className="oui-flex oui-justify-between"
      />
    </DataTable>
  );
};
