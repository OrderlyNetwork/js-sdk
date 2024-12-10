import { MarketsList } from "./marketsList.ui";
import { useMarketsListScript } from "./marketsList.script";
import { SortOrder, DataTableClassNames } from "@orderly.network/ui";
import { GetColumns } from "../../type";

export type MarketsListWidgetProps = {
  type?: "all" | "new";
  sortKey: string;
  sortOrder: SortOrder;
  getColumns?: GetColumns;
  collapsed?: boolean;
  tableClassNames?: DataTableClassNames;
  rowClassName?: string;
  onSort?: (sortKey?: string, sortOrder?: SortOrder) => void;
};

export const MarketsListWidget: React.FC<MarketsListWidgetProps> = (props) => {
  const state = useMarketsListScript(props);

  return (
    <MarketsList
      {...state}
      initialSort={{
        sortKey: props.sortKey,
        sort: props.sortOrder,
      }}
      getColumns={props.getColumns}
      collapsed={props.collapsed}
      tableClassNames={props.tableClassNames}
      rowClassName={props.rowClassName}
    />
  );
};
