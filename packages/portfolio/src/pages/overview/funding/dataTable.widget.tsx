import { DataTable } from "@orderly.network/ui";
import { useColumns } from "./column";
import { FC } from "react";

type DataTableWidgetProps = {
  dataSource: any;
};

export const DataTableWidget: FC<DataTableWidgetProps> = (props) => {
  const { dataSource } = props;
  const columns = useColumns();
  // const dataSource = useDataSource();
  return <DataTable columns={columns} dataSource={dataSource} />;
};
