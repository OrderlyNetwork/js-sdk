import type { ReactElement } from "react";
import { DataTable, DataTableProps } from "../dataTable/table";
import { Box } from "../../box";
import { DataGridFilterBar } from "./dataGridFilterBar";
import { type DataFilterProps } from "./dataFilter";
import { DataGridProvider, PaginationOptions } from "./dataGridContext";
import { DataGridFooter } from "./dataGridFooter";

export type DataGridProps<RecordType = any> = {
  filter?: DataFilterProps;
  pagination?: PaginationOptions;
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
  const FooterElement: ReactElement = footer ?? <DataGridFooter />;
  return (
    <DataGridProvider filter={filter} pagination={props.pagination}>
      <Box>
        {HeaderElement}
        <DataTable {...dataTableProps} />
        {FooterElement}
      </Box>
    </DataGridProvider>
  );
};