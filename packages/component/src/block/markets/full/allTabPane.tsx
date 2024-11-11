import { FC, useEffect, useState } from "react";
import { ListViewFull } from "./listview";
import { MarketsType, useMarket } from "@orderly.network/hooks";
import { useDataSource } from "../useDataSource";
import { API } from "@orderly.network/types";
import { FavoriteButton } from "./favoriteButton";

export const AllTabPane: FC<{
  onClose?: () => void;
  maxHeight: number | undefined;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  fitlerKey: string;
  onItemClick?: (symbol: API.Symbol) => void;
}> = (props) => {
  const { activeIndex, setActiveIndex, onItemClick, fitlerKey } = props;

  const [
    data,
    {
      addToHistory,
      favoriteTabs,
      updateFavoriteTabs,
      updateSymbolFavoriteState,
    },
  ] = useMarket(MarketsType.ALL);
  const [dataSource, { onSearch, onSort }] = useDataSource(
    // @ts-ignore
    data
  );

  useEffect(() => {
    onSearch(fitlerKey);
  }, [fitlerKey]);

  return (
    <ListViewFull
      // @ts-ignore
      // ref={listviewRef}
      activeIndex={activeIndex}
      dataSource={dataSource}
      onSort={onSort}
      readLastSortCondition
      maxHeight={props.maxHeight}
      updateActiveIndex={(index: number) => setActiveIndex(index)}
      onItemClick={(item) => {
        // @ts-ignore
        onItemClick?.(item);
        addToHistory(item);
      }}
      favoriteTabs={favoriteTabs}
      prefixRender={(item, index) => {
        return (
          <FavoriteButton
            symbol={item}
            tabs={favoriteTabs}
            updateFavoriteTabs={updateFavoriteTabs}
            updateSymbolFavoriteState={updateSymbolFavoriteState}
          />
        );
      }}
    />
  );
};
