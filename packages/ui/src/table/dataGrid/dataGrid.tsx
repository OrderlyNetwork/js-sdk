import type { ReactElement } from "react";
import { DataTable, DataTableProps } from "../dataTable/table";
import { Box } from "../../box";
import { DataGridFilterBar } from "./dataGridFilterBar";
import { type DataFilterProps } from "./dataFilter";
import { DataGridProvider } from "./dataGridContext";

export type DataGridProps<RecordType = any> = {
  filter?: DataFilterProps;
  footer?: ReactElement;
  /**
   * The header of the table, if provided it will be rendered above the table.
   * If both filter configuration and header component are provided at the same time,
   * the header component will override the filter component.
   */
  header?: ReactElement;
} & DataTableProps<RecordType>;

export const DataGrid = <T,>(props: DataGridProps<T>) => {
  const { footer, header, filter, ...dataTableProps } = props;
  const HeaderElement: ReactElement = header ?? <DataGridFilterBar />;
  return (
    <DataGridProvider filter={filter}>
      <Box>
        {HeaderElement}
        <DataTable {...dataTableProps} />
        {props.footer}
      </Box>
    </DataGridProvider>
  );
};
