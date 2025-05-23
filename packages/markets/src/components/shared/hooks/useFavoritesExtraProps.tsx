import { useCallback } from "react";
import { Favorite, FavoriteTab } from "@orderly.network/hooks";
import { Box } from "@orderly.network/ui";
import { FavoriteInstance } from "../../../type";
import { FavoritesTabWidget } from "../../favoritesTabs";

export function useFavoritesProps() {
  const renderHeader = useCallback((favorite: FavoriteInstance) => {
    return (
      <Box px={3} className="oui-my-[6px]">
        <FavoritesTabWidget favorite={favorite} size="sm" />
      </Box>
    );
  }, []);

  const dataFilter = useCallback(
    (
      data: any[],
      options: { favorites: Favorite[]; selectedFavoriteTab: FavoriteTab },
    ) => {
      const { favorites, selectedFavoriteTab } = options;

      return favorites
        ?.filter(
          (item) =>
            item.tabs?.findIndex((tab) => tab.id === selectedFavoriteTab.id) !==
            -1,
        )
        ?.map((fav) => {
          const index = data?.findIndex((item) => item.symbol === fav.name);
          if (index !== -1) {
            return data[index];
          }
          return null;
        })
        ?.filter((item) => item);
    },
    [],
  );

  return {
    renderHeader,
    dataFilter,
  };
}
