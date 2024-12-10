import { FavoritesList } from "./favoritesList.ui";
import { useFavoritesListScript } from "./favoritesList.script";
import { GetColumns } from "../../type";
import { DataTableClassNames } from "@orderly.network/ui";

export type FavoritesListWidgetProps = {
  getColumns?: GetColumns;
  collapsed?: boolean;
  tableClassNames?: DataTableClassNames;
  rowClassName?: string;
};

export const FavoritesListWidget: React.FC<FavoritesListWidgetProps> = (
  props
) => {
  const state = useFavoritesListScript();
  return <FavoritesList {...state} {...props} />;
};
