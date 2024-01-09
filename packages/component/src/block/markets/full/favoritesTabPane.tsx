import { FC, useEffect } from "react";
import { ListViewFull } from "./listview";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { useDataSource } from "../useDataSource";
import { API } from "@orderly.network/types";

export const FavoritesTabPane: FC<{
    onClose?: () => void,
    maxHeight: number | undefined,
    activeIndex: number,
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
    fitlerKey: string,
    onItemClick?: (symbol: API.Symbol) => void,
}> = (props) => {
    const { activeIndex, setActiveIndex, onItemClick, fitlerKey } = props;

    const [data, { addToHistory, addToFavorites, removeFromFavorites }] = useMarkets(MarketsType.FAVORITES);
    const [dataSource, { onSearch, onSort }] = useDataSource(
        data
    );

    useEffect(() => {
        onSearch(fitlerKey);
    }, [fitlerKey]);

    return (<ListViewFull
        // @ts-ignore
        // ref={listviewRef}
        activeIndex={activeIndex}
        dataSource={dataSource}
        onSort={onSort}
        maxHeight={props.maxHeight}
        updateActiveIndex={(index: number) => setActiveIndex(index)}
        // @ts-ignore
        onItemClick={(item) => {
            onItemClick?.(item);
            addToHistory(item);
        }}
    />);
}