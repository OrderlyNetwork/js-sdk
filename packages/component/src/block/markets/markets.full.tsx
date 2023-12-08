import { FC, useMemo, useState } from "react";
import { Header } from "./full/header";
import { MarketsProps } from "./markets";
import { ListViewFull } from "./full/listview";
import { useDataSource } from "./useDataSource";
import { MoveDirection } from "./full/search";

interface Props {
  maxHeight?: number;
  onClose?: () => void;
}

export const MarketsFull: FC<MarketsProps & Props> = (props) => {
  // const [searchKey, setSearchKey] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [dataSource, { searchKey, onSearch, onSort }] = useDataSource(
    props.dataSource
  );

  const onKeywordChange = (key: string) => {
    onSearch(key);
    setActiveIndex(-1);
  };

  const onMoving = (direction: MoveDirection) => {
    if (dataSource?.length === 0) return;
    if (direction === MoveDirection.Up) {
      setActiveIndex((prev) => prev - 1);
    } else if (direction === MoveDirection.Down) {
      setActiveIndex((prev) => (prev + 1) % dataSource!.length);
    }
  };

  const onSymbolSelect = () => {
    if (activeIndex === -1) return;
    const symbol = dataSource?.[activeIndex];
    if (symbol) {
      props.onItemClick?.(symbol);
    }
  };

  return (
    <div className="orderly-grid grid-rows-[40px_1fr]">
      <Header
        onSearch={onKeywordChange}
        keyword={searchKey}
        onMoving={onMoving}
        onClose={props.onClose}
        onSymbolSelect={onSymbolSelect}
      />
      <ListViewFull
        activeIndex={activeIndex}
        dataSource={dataSource}
        onSort={onSort}
        maxHeight={props.maxHeight}
        updateActiveIndex={(index: number) => setActiveIndex(index)}
      />
    </div>
  );
};
