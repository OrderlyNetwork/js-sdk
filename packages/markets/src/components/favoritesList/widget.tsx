import { FavoritesList } from "./favoritesList.ui";
import { useFavoritesListScript } from "./favoritesList.script";

export const FavoritesListWidget: React.FC = () => {
  const state = useFavoritesListScript();
  return <FavoritesList {...state} />;
};
