import { FC } from "react";
import { DataTable, Filter, Pagination } from "@orderly.network/ui";
import { SIDES, useAssetHistoryColumns } from "./column";
import { type UseAssetHistoryReturn } from "./useDataSource.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";

type AssetHistoryProps = {
  // dataSource?: any[];
  // page?: number;
  // pageSize?: number;
  // dataCount?: number;
} & UseAssetHistoryReturn;

export const AssetHistory: FC<AssetHistoryProps> = (props) => {
  const {
    dataSource,
    meta,
    setPage,
    setPageSize,
    queryParameter,
    onFilter,
    isLoading,
  } = props;
  const { side, dateRange } = queryParameter;
  const columns = useAssetHistoryColumns();

  return (
    <AuthGuardDataTable
      bordered
      loading={isLoading}
      classNames={{
        header: "oui-text-base-contrast-36",
        body: "oui-text-base-contrast-80",
      }}
      columns={columns}
      dataSource={dataSource}
    >
      <Filter
        items={[
          {
            type: "select",
            name: "side",
            options: SIDES,
            value: side,
          },
          {
            type: "range",
            name: "dateRange",
            value: {
              from: dateRange[0],
              to: dateRange[1],
            },
          },
        ]}
        onFilter={(value) => {
          onFilter(value);
        }}
      />
      <Pagination
        {...meta}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </AuthGuardDataTable>
  );
};
