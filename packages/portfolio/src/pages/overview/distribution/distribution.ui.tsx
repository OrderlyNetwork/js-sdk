import { DataTable, Filter, Pagination } from "@orderly.network/ui";
import { TYPES, useColumns } from "./column";
import { FC } from "react";
import { type useDistributionHistoryHookReturn } from "./useDataSource.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";

type FundingHistoryProps = {} & useDistributionHistoryHookReturn;

export const DistributionHistoryUI: FC<FundingHistoryProps> = (props) => {
  const {
    dataSource,
    queryParameter,
    onFilter,
    isLoading,
    meta,
    setPage,
    setPageSize,
  } = props;
  const columns = useColumns();
  const { type, dateRange } = queryParameter;

  return (
    <AuthGuardDataTable
      bordered
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      className="oui-font-semibold"
    >
      <Filter
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
      <Pagination
        {...meta}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </AuthGuardDataTable>
  );
};
