import { FavoritesList } from "./favoritesList.ui";
import { useFavoritesListScript } from "./favoritesList.script";
import { GetColumns } from "../../type";

export type FavoritesListWidgetProps = {
  getColumns?: GetColumns;
  collapsed?: boolean;
};

export const FavoritesListWidget: React.FC<FavoritesListWidgetProps> = (
  props
) => {
  const state = useFavoritesListScript();
  return <FavoritesList {...state} {...props} />;
};
