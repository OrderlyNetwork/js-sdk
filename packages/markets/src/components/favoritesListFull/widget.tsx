import { FavoritesListFull } from "./favoritesListFull.ui";
import { useFavoritesListFullScript } from "./favoritesListFull.script";

export const FavoritesListFullWidget: React.FC = () => {
  const state = useFavoritesListFullScript();
  return <FavoritesListFull {...state} />;
};
