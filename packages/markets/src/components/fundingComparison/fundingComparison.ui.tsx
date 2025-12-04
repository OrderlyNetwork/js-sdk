import type { FC } from "react";
import { cn } from "@veltodefi/ui";
import { DataTable } from "@veltodefi/ui";
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
