import { useFavoritesListFullScript } from "./favoritesListFull.script";
import { FavoritesListFull } from "./favoritesListFull.ui";

export const FavoritesListFullWidget: React.FC = () => {
  const state = useFavoritesListFullScript();
  return <FavoritesListFull {...state} />;
};
