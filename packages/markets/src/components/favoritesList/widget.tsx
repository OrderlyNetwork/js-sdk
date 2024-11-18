import { FavoritesList } from "./favoritesList.ui";
import { useFavoritesListScript } from "./favoritesList.script";
import { GetColumns } from "../../type";
import { TableViewClassNames } from "@orderly.network/ui";

export type FavoritesListWidgetProps = {
  getColumns?: GetColumns;
  collapsed?: boolean;
  tableClassNames?: TableViewClassNames;
  rowClassName?: string;
};

export const FavoritesListWidget: React.FC<FavoritesListWidgetProps> = (
  props
) => {
  const state = useFavoritesListScript();
  return <FavoritesList {...state} {...props} />;
};
