import { ReactNode } from "react";
import { useFavoritesListFullScript } from "./favoritesListFull.script";
import { FavoritesListFull } from "./favoritesListFull.ui";

export type FavoritesListFullWidgetProps = {
  emptyView?: ReactNode;
  hideEmptyTable?: boolean;
};

export const FavoritesListFullWidget: React.FC<FavoritesListFullWidgetProps> = (
  props,
) => {
  const state = useFavoritesListFullScript();
  return (
    <FavoritesListFull
      {...state}
      emptyView={props.emptyView}
      hideEmptyTable={props.hideEmptyTable}
    />
  );
};
