import { Favorites } from "./favorites.ui";
import { useFavoritesScript } from "./favorites.script";

export const FavoritesWidget: React.FC = () => {
  const state = useFavoritesScript();
  return <Favorites {...state} />;
};
