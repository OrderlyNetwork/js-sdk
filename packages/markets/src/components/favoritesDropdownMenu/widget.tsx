import { PropsWithChildren } from "react";
import { FavoritesDropdownMenu } from "./favoritesDropdownMenu.ui";
import {
  useFavoritesDropdownMenuScript,
  UseFavoritesDropdownMenuScriptOptions,
} from "./favoritesDropdownMenu.script";

export type FavoritesDropdownMenuWidgetProps =
  PropsWithChildren<UseFavoritesDropdownMenuScriptOptions>;

export const FavoritesDropdownMenuWidget: React.FC<
  FavoritesDropdownMenuWidgetProps
> = (props) => {
  const state = useFavoritesDropdownMenuScript(props);
  return (
    <FavoritesDropdownMenu {...state}>{props.children}</FavoritesDropdownMenu>
  );
};
