import { DataFilterProps, DataTableFilter } from "./dataFilter";
import { useTable } from "../dataTable/tableContext";

export const Filter = (props: DataFilterProps) => {
  const { meta } = useTable();

  if (!meta) {
    throw new Error(
      "Filter component should be used inside `DataTable` component"
    );
  }

  return <DataTableFilter {...props} />;
};

Filter.displayName = "DataFilter";
