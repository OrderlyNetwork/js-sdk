import { FavoritesTab } from "./favoritesTabs.ui";
import {
  useFavoritesTabScript,
  UseFavoritesTabScriptOptions,
} from "./favoritesTabs.script";

export type FavoritesTabWidgetProps = UseFavoritesTabScriptOptions;

export const FavoritesTabWidget: React.FC<FavoritesTabWidgetProps> = (
  props
) => {
  const state = useFavoritesTabScript(props);
  return <FavoritesTab {...state} size={props.size} />;
};
