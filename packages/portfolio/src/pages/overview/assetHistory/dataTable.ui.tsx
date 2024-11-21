import { FC } from "react";
import { DataFilter } from "@orderly.network/ui";
import { SIDES, useAssetHistoryColumns } from "./column";
import { type UseAssetHistoryReturn } from "./useDataSource.script";
import { AuthGuardTableView } from "@orderly.network/ui-connector";

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
    <>
      <DataFilter
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

      <AuthGuardTableView
        bordered
        loading={isLoading}
        classNames={{ root: "oui-h-[calc(100%_-_49px)]" }}
        columns={columns}
        dataSource={dataSource}
        pagination={props.pagination}
      />
    </>
  );

  // return (
  //   <AuthGuardDataTable
  //     bordered
  //     loading={isLoading}
  //     classNames={{
  //       header: "oui-text-base-contrast-36",
  //       body: "oui-text-base-contrast-80",
  //     }}
  //     columns={columns}
  //     dataSource={dataSource}
  //   >
  //     <Filter
  //       items={[
  //         {
  //           type: "select",
  //           name: "side",
  //           options: SIDES,
  //           value: side,
  //         },
  //         {
  //           type: "range",
  //           name: "dateRange",
  //           value: {
  //             from: dateRange[0],
  //             to: dateRange[1],
  //           },
  //         },
  //       ]}
  //       onFilter={(value) => {
  //         onFilter(value);
  //       }}
  //     />
  //     <Pagination
  //       {...meta}
  //       onPageChange={setPage}
  //       onPageSizeChange={setPageSize}
  //     />
  //   </AuthGuardDataTable>
  // );
};
