import { DataFilter } from "@orderly.network/ui";
import { TYPES, useColumns } from "./column";
import { FC } from "react";
import { type useDistributionHistoryHookReturn } from "./useDataSource.script";
import { AuthGuardTableView } from "@orderly.network/ui-connector";

type FundingHistoryProps = {} & useDistributionHistoryHookReturn;

export const DistributionHistoryUI: FC<FundingHistoryProps> = (props) => {
  const {
    dataSource,
    queryParameter,
    onFilter,
    isLoading,
    isValidating,
    meta,
    setPage,
    setPageSize,
  } = props;
  const columns = useColumns();
  const { type, dateRange } = queryParameter;

  return (
    <>
      <DataFilter
        items={[
          {
            type: "select",
            name: "type",
            options: TYPES,
            value: type,
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
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        // isValidating={isValidating}
        className="oui-font-semibold"
        classNames={{
          root: "oui-h-[calc(100%_-_49px)]",
        }}
        pagination={props.pagination}
      />
    </>
  );

  // return (
  //   <AuthGuardDataTable
  //     bordered
  //     columns={columns}
  //     dataSource={dataSource}
  //     loading={isLoading}
  //     isValidating={isValidating}
  //     className="oui-font-semibold"
  //     classNames={{
  //       header: "oui-text-base-contrast-36",
  //       body: "oui-text-base-contrast-80",
  //     }}
  //   >
  //     <Filter
  //       items={[
  //         {
  //           type: "select",
  //           name: "type",
  //           options: TYPES,
  //           value: type,
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
