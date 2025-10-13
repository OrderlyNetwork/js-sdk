import type { FC } from "react";
import { cn } from "@kodiak-finance/orderly-ui";
import { DataTable } from "@kodiak-finance/orderly-ui";
import { useFundingColumns } from "./columns";
import { FundingComparisonReturn } from "./fundingComparison.script";

export const FundingComparison: FC<FundingComparisonReturn> = (props) => {
  const columns = useFundingColumns();

  return (
    <DataTable
      columns={columns}
      dataSource={props.dataSource}
      loading={props.isLoading}
      onRow={() => {
        return {
          className: cn("oui-h-[48px] oui-cursor-pointer"),
        };
      }}
      classNames={{
        header: "oui-h-12",
      }}
      bordered
      pagination={props.pagination}
    />
  );
};
