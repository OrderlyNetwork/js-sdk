import { FC, useCallback, useContext, useMemo, useRef, useState } from "react";
import { TabPane, Tabs } from "@/tab";
import { Header } from "./full/header";
import { ListViewFull } from "./full/listview";
import { useDataSource } from "./useDataSource";
import { MoveDirection } from "./full/search";
import { ListViewRef } from "@/listView/listView";
import {
  MarketsProps,
  SortCondition,
  SortDirection,
  SortKey,
} from "./shared/types";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { RecentTabPane } from "./full/recentTabPane";
import { AllTabPane } from "./full/allTabPane";
import { FavoritesTabPane } from "./full/favoritesTabPane";

interface Props {
  maxHeight?: number;
  onClose?: () => void;
  // ref: ListViewRef;
}

export const MarketsFull: FC<MarketsProps & Props> = (props) => {
  const [searchKey, setSearchKey] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // const [dataSource, { searchKey, onSearch, onSort }] = useDataSource(
  //   props.dataSource
  // );

  // const { onSymbolChange } = useContext(TradingPageContext);

  // const onSymbolClick = useCallback(
  //   (symbol: any) => {
  //     props.onClose?.();
  //     onSymbolChange?.(symbol);
  //   },
  //   [onSymbolChange]
  // );

  // const listviewRef = useRef<
  //   | {
  //     scroll: (direction: { x: number; y: number }) => void;
  //   }
  //   | undefined
  // >();

  // const onKeywordChange = (key: string) => {
  //   onSearch(key);
  //   setActiveIndex(-1);
  // };

  // const onMoving = (direction: MoveDirection) => {
  //   if (dataSource?.length === 0) return;
  //   let nextIndex = activeIndex;
  //   if (direction === MoveDirection.Up) {
  //     nextIndex = activeIndex < 0 ? dataSource!.length - 1 : activeIndex - 1;
  //   } else if (direction === MoveDirection.Down) {
  //     nextIndex = (activeIndex + 1) % dataSource!.length;
  //   }

  //   setActiveIndex(nextIndex);

  //   setTimeout(() => {
  //     listviewRef.current?.scroll({
  //       x: 0,
  //       y: Math.max(40 * nextIndex, 0),
  //     });
  //   }, 0);
  // };

  const onSymbolSelect = () => {
    // if (activeIndex === -1) return;
    // const symbol = dataSource?.[activeIndex];
    // if (symbol) {
    //   props.onItemClick?.(symbol);
    // }
  };

  const onMoving = (direction: MoveDirection) => {};

  return (
    <div
      id="orderly-markets-desktop"
      className="orderly-grid grid-rows-[40px_1fr] orderly-tabular-nums orderly-pb-2"
    >
      <Header
        onSearch={setSearchKey}
        keyword={searchKey}
        onMoving={(direction) => onMoving(direction)}
        onClose={props.onClose}
        onSymbolSelect={onSymbolSelect}
      />
      {/* <ListViewFull
        // @ts-ignore
        ref={listviewRef}
        activeIndex={activeIndex}
        dataSource={dataSource}
        onSort={onSort}
        maxHeight={props.maxHeight}
        updateActiveIndex={(index: number) => setActiveIndex(index)}
        onItemClick={onSymbolClick}
      /> */}

      <MarketsBody
        onClose={props.onClose}
        maxHeight={props.maxHeight}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        // onSort={onSort}
        // onItemClick={onSymbolClick}
        fitlerKey={searchKey}
      />
    </div>
  );
};

const MarketsBody: FC<{
  onClose?: () => void;
  maxHeight: number | undefined;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  fitlerKey: string;
}> = (props) => {
  const { activeIndex, setActiveIndex, fitlerKey } = props;

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("markets_sel_tab_key") || "all"
  );

  const { onSymbolChange } = useContext(TradingPageContext);

  const onSymbolClick = useCallback(
    (symbol: any) => {
      props.onClose?.();
      onSymbolChange?.(symbol);
    },
    [onSymbolChange]
  );

  const updateActiveTab = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("markets_sel_tab_key", value);
  };

  return (
    <Tabs
      id="orderly-markets-desktop-tab"
      autoFit
      value={activeTab}
      onTabChange={updateActiveTab}
      tabBarClassName="orderly-h-[48px] orderly-text-sm desktop:orderly-font-semibold orderly-bg-base-800"
    >
      <TabPane
        id="orderly-markets-desktop-favorites-pane"
        title="Favorites"
        value="favorites"
        className="orderly-px-0"
      >
        <FavoritesTabPane
          onClose={props.onClose}
          maxHeight={props.maxHeight}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          fitlerKey={fitlerKey}
          onItemClick={onSymbolClick}
        />
      </TabPane>
      <TabPane
        id="orderly-markets-desktop-recent-pane"
        title="Recent"
        value="recent"
        className="orderly-px-0"
      >
        <RecentTabPane
          onClose={props.onClose}
          maxHeight={props.maxHeight}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          fitlerKey={fitlerKey}
          onItemClick={onSymbolClick}
        />
      </TabPane>
      <TabPane
        id="orderly-markets-desktop-all-pane"
        title="All"
        value="all"
        className="orderly-px-0"
      >
        <AllTabPane
          onClose={props.onClose}
          maxHeight={props.maxHeight}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          fitlerKey={fitlerKey}
          onItemClick={onSymbolClick}
        />
      </TabPane>
    </Tabs>
  );
};
