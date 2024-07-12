import { Favorites } from "./favorites.ui";
import { useFavoritesScript } from "./favorites.script";


export const FavoritesWidget: React.FC = (props) => {
  const state = useFavoritesScript();
  return <Favorites {...state} />;
};
