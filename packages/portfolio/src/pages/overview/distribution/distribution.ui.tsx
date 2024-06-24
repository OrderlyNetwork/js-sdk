import { DataTable } from "@orderly.network/ui";
import { useColumns } from "./column";
import { FC } from "react";

type FundingHistoryProps = {
  dataSource: any;
  isLoading: boolean;
};

export const DistributionHistoryUI: FC<FundingHistoryProps> = (props) => {
  const { dataSource, isLoading } = props;
  const columns = useColumns();

  return (
    <DataTable
      bordered
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      className="oui-font-semibold"
      headerClassName="oui-text-base-contrast-36"
      bodyClassName="oui-text-base-contrast-80"
    />
  );
};
