import { FC, useMemo, useRef, useState } from "react";
import { Header } from "./full/header";
import { MarketsProps } from "./markets";
import { ListViewFull } from "./full/listview";
import { useDataSource } from "./useDataSource";
import { MoveDirection } from "./full/search";
import { ListViewRef } from "@/listView/listView";

interface Props {
  maxHeight?: number;
  onClose?: () => void;
  // ref: ListViewRef;
}

export const MarketsFull: FC<MarketsProps & Props> = (props) => {
  // const [searchKey, setSearchKey] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [dataSource, { searchKey, onSearch, onSort }] = useDataSource(
    props.dataSource
  );

  const listviewRef = useRef<{
    scroll: (direction: { x: number; y: number }) => void;
  }>();

  const onKeywordChange = (key: string) => {
    onSearch(key);
    setActiveIndex(-1);
  };

  const onMoving = (direction: MoveDirection) => {
    if (dataSource?.length === 0) return;
    let nextIndex = activeIndex;
    if (direction === MoveDirection.Up) {
      nextIndex = activeIndex < 0 ? dataSource!.length - 1 : activeIndex - 1;
    } else if (direction === MoveDirection.Down) {
      nextIndex = (activeIndex + 1) % dataSource!.length;
    }

    setActiveIndex(nextIndex);

    setTimeout(() => {
      listviewRef.current?.scroll({
        x: 0,
        y: Math.max(40 * nextIndex, 0),
      });
    }, 0);
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
        ref={listviewRef}
        activeIndex={activeIndex}
        dataSource={dataSource}
        onSort={onSort}
        maxHeight={props.maxHeight}
        updateActiveIndex={(index: number) => setActiveIndex(index)}
      />
    </div>
  );
};
function ForwardedRef<T>(arg0: null) {
  throw new Error("Function not implemented.");
}
