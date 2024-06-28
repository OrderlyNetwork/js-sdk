import { DataTable } from "@orderly.network/ui";
import { useFundingHistoryColumns } from "./column";
import { FC } from "react";

type FundingHistoryProps = {
  dataSource: any;
  isLoading: boolean;
};

export const FundingHistoryUI: FC<FundingHistoryProps> = (props) => {
  const { dataSource, isLoading } = props;
  const columns = useFundingHistoryColumns();

  return (
    <DataTable
      bordered
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      className="oui-font-semibold"
      classNames={{
        header: "oui-text-base-contrast-36",
        body: "oui-text-base-contrast-80",
      }}
    />
  );
};
