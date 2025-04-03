import { DataFilter } from "@orderly.network/ui";
import { useFundingHistoryColumns } from "./column";
import { FC } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { type UseFundingHistoryReturn } from "./useDataSource.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
type FundingHistoryProps = {} & UseFundingHistoryReturn;

export const FundingHistoryUI: FC<FundingHistoryProps> = (props) => {
  const { dataSource, queryParameter, onFilter, isLoading } = props;
  const columns = useFundingHistoryColumns();
  const symbols = useSymbolsInfo();
  const { symbol, dateRange } = queryParameter;


  return (
    <>
      <DataFilter
        items={[
          {
            type: "select",
            name: "symbol",
            isCombine: true,
            options: [
              {
                label: "All",
                value: "All",
              },
              ...Object.keys(symbols).map((symbol) => {
                const s = symbol.split("_")[1];
                return {
                  label: s,
                  value: symbol,
                };
              }),
            ],
            value: symbol,
            valueFormatter: (value) => {
              if (value === "All") {
                return "All";
              }
              return value.split("_")[1];
            },
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
      <AuthGuardDataTable
        bordered
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        generatedRowKey={(record) => `${record.updated_time}`}
        classNames={{ root: "oui-h-[calc(100%_-_49px)]" }}
        pagination={props.pagination}
      />
    </>
  );
};
