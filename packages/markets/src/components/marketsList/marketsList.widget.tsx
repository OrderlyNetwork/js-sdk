import { ReactNode } from "react";
import { Favorite, FavoriteTab } from "@orderly.network/hooks";
import { DataTableClassNames } from "@orderly.network/ui";
import { FavoriteInstance, GetColumns, SortType, TabName } from "../../type";
import { useMarketsListScript } from "./marketsList.script";
import { MarketsList } from "./marketsList.ui";

export type MarketsListWidgetProps = {
  type: TabName;
  getColumns?: GetColumns;
  collapsed?: boolean;
  tableClassNames?: DataTableClassNames;
  rowClassName?: string;
  initialSort?: SortType;
  onSort?: (sort?: SortType) => void;
  renderHeader?: (favorite: FavoriteInstance) => ReactNode;
  dataFilter?: (
    data: any[],
    options: { favorites: Favorite[]; selectedFavoriteTab: FavoriteTab },
  ) => any[];
};

export const MarketsListWidget: React.FC<MarketsListWidgetProps> = (props) => {
  const state = useMarketsListScript(props);

  return (
    <MarketsList
      {...state}
      initialSort={props.initialSort}
      getColumns={props.getColumns}
      collapsed={props.collapsed}
      tableClassNames={props.tableClassNames}
      rowClassName={props.rowClassName}
      renderHeader={props.renderHeader}
    />
  );
};
