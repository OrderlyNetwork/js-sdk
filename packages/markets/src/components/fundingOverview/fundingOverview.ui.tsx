import { FC, useState } from "react";
import { DataTable, Text, Flex, cn } from "@orderly.network/ui";
import {
  ProcessedFundingData,
  UseFundingOverviewReturn,
} from "./fundingOverview.script";
import { useFundingOverviewColumns } from "./columns";

export type FundingOverviewProps = UseFundingOverviewReturn;

export const FundingOverview: FC<FundingOverviewProps> = (props) => {
  const { dataSource, isLoading, pagination, onSort } = props;
  const [selectedPeriod, setSelectedPeriod] = useState("1dPositive");

  const columns = useFundingOverviewColumns(selectedPeriod, setSelectedPeriod);

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        bordered
        onRow={() => {
          return {
            className: cn("oui-h-[48px] oui-cursor-pointer"),
          };
        }}
        classNames={{
          header: "oui-h-12",
        }}
        pagination={pagination}
        onSort={onSort}
        manualSorting
        generatedRowKey={(record) => record.symbol}
      />
    </div>
  );
};
