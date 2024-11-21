import { FC, useEffect, useMemo } from "react";
import { ListViewFull } from "./listview";
import { MarketsType, useMarket } from "@orderly.network/hooks";
import { useDataSource } from "../useDataSource";
import { API } from "@orderly.network/types";
import { FavoriteButton } from "./favoriteButton";

export const RecentTabPane: FC<{
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
      recent,
      addToHistory,
      favoriteTabs,
      updateFavoriteTabs,
      updateSymbolFavoriteState,
    },
  ] = useMarket(MarketsType.RECENT);
  const filterData = useMemo(() => {
    return recent
      ?.map((item) => {
        const index = data.findIndex(
          (symbol: any) => item.name === symbol.symbol
        );
        if (index === -1) {
          return null;
        }
        return data[index];
      })
      .map((item) => item)
      .filter((e: any) => e !== null);
  }, [data, recent]);

  const [dataSource, { onSearch, onSort }] = useDataSource(
    // @ts-ignore
    filterData
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
      readLastSortCondition={false}
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
