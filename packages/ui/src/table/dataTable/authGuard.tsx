import { PropsWithChildren } from "react";
import { DataTable, DataTableProps } from "./table";

const AuthGuardTable = <RecordType extends unknown>(
  props: PropsWithChildren<
    DataTableProps<RecordType> & {
      status?: number;
    }
  >
) => {
  return <DataTable {...props} />;
};
