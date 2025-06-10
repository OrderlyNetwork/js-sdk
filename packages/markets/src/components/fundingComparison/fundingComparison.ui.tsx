import type { FC } from "react";
import type { PaginationMeta } from "@orderly.network/ui";
import { cn } from "@orderly.network/ui";
import { DataTable } from "@orderly.network/ui";
import { useFundingColumns } from "./columns";

interface FundingComparisonProps {
  data: Array<{
    symbol: string;
    funding: (number | null)[];
  }>;
  isLoading: boolean;
  pagination: PaginationMeta;
}

export const FundingComparison: FC<FundingComparisonProps> = ({
  data,
  isLoading,
  pagination,
}) => {
  const columns = useFundingColumns();

  return (
    <DataTable
      columns={columns}
      dataSource={data}
      loading={isLoading}
      onRow={() => {
        return {
          className: cn("oui-h-[48px] oui-cursor-pointer"),
        };
      }}
      classNames={{
        header: "oui-h-12",
      }}
      bordered
      pagination={pagination}
    />
  );
};
