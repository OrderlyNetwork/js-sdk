import { MarketsList } from "./marketsList.ui";
import { useMarketsListScript } from "./marketsList.script";
import { SortOrder, TableViewClassNames } from "@orderly.network/ui";
import { GetColumns } from "../../type";

export type MarketsListWidgetProps = {
  type?: "all" | "new";
  sortKey: string;
  sortOrder: SortOrder;
  getColumns?: GetColumns;
  collapsed?: boolean;
  tableClassNames?: TableViewClassNames;
  rowClassName?: string;
};

export const MarketsListWidget: React.FC<MarketsListWidgetProps> = (props) => {
  const state = useMarketsListScript(props);

  const sortStore = props.type === "all" ? state.tabSort?.all : undefined;

  return (
    <MarketsList
      {...state}
      initialSort={{
        sortKey: sortStore?.sortKey || props.sortKey,
        sort: (sortStore?.sortOrder as SortOrder) || props.sortOrder,
      }}
      getColumns={props.getColumns}
      collapsed={props.collapsed}
      tableClassNames={props.tableClassNames}
      rowClassName={props.rowClassName}
    />
  );
};
