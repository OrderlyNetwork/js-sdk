import { DataTable } from "@orderly.network/ui";
import { useColumns } from "./column";
import { useDataSource } from "./datasource";

export const DepositsAndWithdrawRecord = () => {
  const columns = useColumns();
  const dataSource = useDataSource();
  return <DataTable columns={columns} dataSource={dataSource} />;
};
