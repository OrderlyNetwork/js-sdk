import { DataTableFilter } from "./dataFilter";
import { useDataGridContext } from "./dataGridContext";

export const DataGridFilterBar = () => {
  const { filter } = useDataGridContext();

  if (!filter || !filter.items) {
    return null;
  }

  return <DataTableFilter items={filter.items} onFilter={filter.onFilter} />;
};
