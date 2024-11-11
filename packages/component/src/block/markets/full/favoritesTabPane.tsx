import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ListViewFull } from "./listview";
// @ts-ignore
import {
  MarketsType,
  useMarket,
  FavoriteTab,
  Favorite,
  OrderlyContext,
} from "@orderly.network/hooks";
import { useDataSource } from "../useDataSource";
import { API } from "@orderly.network/types";
import { CircleAdd, CircleCloseIcon, ArrowTopIcon, AddIcon } from "@/icon";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/utils";
import { modal } from "@orderly.network/ui";

export const FavoritesTabPane: FC<{
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
      favorites,
      addToHistory,
      favoriteTabs,
      updateFavoriteTabs,
      updateSymbolFavoriteState,
      pinToTop,
      getLastSelFavTab,
      updateSelectedFavoriteTab,
    },
  ] = useMarket(MarketsType.FAVORITES);
  const [currTab, setCurrTab] = useState(getLastSelFavTab || favoriteTabs[0]);

  const clickTab = (tab: any) => {
    updateSelectedFavoriteTab(tab);
    setCurrTab(tab);
  };

  const filterData = useMemo(() => {
    return favorites
      ?.filter((item: any) => {
        const unIgnore =
          item.tabs.findIndex((tab: any) => tab.id === currTab.id) !== -1;
        return unIgnore;
      })
      ?.map((item: any) => {
        const index = data.findIndex(
          (symbol: any) => symbol.symbol === item.name
        );
        if (index !== -1) {
          return data[index];
        }
        return null;
      })
      ?.filter((item: any) => item);
  }, [currTab, data, favorites]);

  const [dataSource, { onSearch, onSort }] = useDataSource(
    // @ts-ignore
    filterData || []
  );

  useEffect(() => {
    onSearch(fitlerKey);
  }, [fitlerKey]);

  return (
    <div>
      <FavoritesTabList
        currTab={currTab}
        setCurrTab={clickTab}
        tabs={favoriteTabs}
        updateFavoriteTabs={updateFavoriteTabs}
        updateSymbolFavoriteState={updateSymbolFavoriteState}
        favorites={favorites}
      />
      <ListViewFull
        // @ts-ignore
        // ref={listviewRef}
        activeIndex={activeIndex}
        dataSource={dataSource}
        onSort={onSort}
        readLastSortCondition={false}
        maxHeight={props.maxHeight}
        updateActiveIndex={(index: number) => setActiveIndex(index)}
        // @ts-ignore
        onItemClick={(item) => {
          // @ts-ignore
          onItemClick?.(item);
          addToHistory(item);
        }}
        favoriteTabs={favoriteTabs}
        suffixRender={(item) => {
          return (
            <div className="orderly-inline-flex orderly-h-full orderly-items-start orderly-justify-end">
              <button
                className="orderly-p-1"
                onClick={(e) => {
                  pinToTop(item);
                  e.stopPropagation();
                }}
              >
                <ArrowTopIcon
                  size={16}
                  fill="current"
                  fillOpacity={1}
                  className="orderly-fill-white/20 hover:orderly-fill-white/80"
                />
              </button>
              <button
                className="orderly-p-1"
                onClick={(e) => {
                  updateSymbolFavoriteState(item, currTab, true);
                  e.stopPropagation();
                }}
              >
                <CircleCloseIcon
                  size={16}
                  fill="current"
                  fillOpacity={1}
                  className="orderly-fill-white/20 hover:orderly-fill-white/80"
                />
              </button>
            </div>
          );
        }}
      />
    </div>
  );
};

const FavoritesTabList: FC<{
  currTab: FavoriteTab;
  setCurrTab: any;
  tabs: FavoriteTab[];
  updateSymbolFavoriteState: (
    symbol: API.MarketInfoExt,
    tab: any,
    del?: boolean
  ) => void;
  updateFavoriteTabs: (
    tab: any,
    operator: {
      add?: boolean;
      update?: boolean;
      delete?: boolean;
    }
  ) => void;
  favorites: Favorite[];
}> = (props) => {
  const [leadingVisible, setLeadingVisible] = useState(false);
  const [tailingVisible, setTailingVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leadingElementRef = useRef<HTMLDivElement>(null);
  const tailingElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      for (let index = 0; index < entries.length; index++) {
        const item = entries[index];
        if (item) {
          if (item.target === leadingElementRef.current) {
            setLeadingVisible(!item.isIntersecting);
          }

          if (item.target === tailingElementRef.current) {
            setTailingVisible(!item.isIntersecting);
          }
        }
      }
    });
    if (leadingElementRef.current) {
      intersectionObserver.observe(leadingElementRef.current);
    }

    if (tailingElementRef.current) {
      intersectionObserver.observe(tailingElementRef.current);
    }

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  const onScollButtonClick = (direction: string, offset: number = 100) => {
    if (direction === "left")
      containerRef.current?.scrollBy({ left: -offset, behavior: "smooth" });
    else containerRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  const onClickDeleteTab = (tab: FavoriteTab) => {
    modal.confirm({
      // maxWidth: "xs",
      // closeableSize: 12,
      // title: "Are you sure you want to delete this watchlist?",
      content: (
        <div className="orderly-pt-0 orderly-text-sm">
          Are you sure you want to delete this watchlist?
        </div>
      ),
      onCancel: () => {
        return Promise.reject();
      },
      onOk: async () => {
        let index = props.tabs.findIndex((item) => item.id == props.currTab.id);
        if (index === -1) return;
        index++;
        if (index >= props.tabs.length) {
          index = 0;
        }
        props.updateFavoriteTabs(tab, { delete: true });

        [...props.favorites].forEach((item) => {
          const newTabs = item.tabs.filter(
            (value: FavoriteTab) => value.id === tab.id
          );

          if (newTabs.length !== item.tabs.length) {
            // @ts-ignore
            props.updateSymbolFavoriteState({ symbol: item.name }, newTabs);
          }
        });

        props.setCurrTab(props.tabs[index]);
      },
    });
  };

  return (
    <div className="orderly-h-[58px] orderly-bg-base-800 orderly-w-full orderly-flex orderly-items-center">
      <button
        className="orderly-px-6 orderly-h-[58px] orderly-flex orderly-items-center orderly-fill-base-contrast-36 hover:orderly-fill-base-contrast"
        onClick={(e) => {
          const newTab = {
            name: `WatchList_${props.tabs.length}`,
            id: Date.now(),
          };
          props.updateFavoriteTabs(newTab, { add: true });
          props.setCurrTab(newTab);
          setTimeout(() => {
            onScollButtonClick("right", 9999);
          }, 100);
        }}
      >
        <AddIcon size={14} fill="current" fillOpacity={1.0} />
      </button>
      <div className="orderly-relative orderly-overflow-hidden orderly-h-full orderly-w-full orderly-bg-base-800">
        <div
          className="orderly-flex  orderly-relative orderly-items-center orderly-h-full orderly-overflow-x-auto orderly-hide-scrollbar"
          ref={containerRef}
        >
          <div ref={leadingElementRef} />

          {props.tabs.map((item) => (
            <FavoriteTabItem
              currTab={props.currTab}
              setCurrTab={props.setCurrTab}
              item={item}
              onClickDeleteTab={onClickDeleteTab}
              updateFavoriteTabs={props.updateFavoriteTabs}
            />
          ))}

          <div ref={tailingElementRef} />
        </div>
      </div>
      <div className="orderly-flex orderly-items-center orderly-w-[40px] orderly-h-full orderly-mx-2">
        {leadingVisible && (
          <button
            className="orderly-flex-1"
            onClick={() => onScollButtonClick("left")}
          >
            {/* @ts-ignore */}
            <ChevronLeft className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80" />
          </button>
        )}
        {tailingVisible && (
          <button
            className="orderly-flex-1"
            onClick={() => onScollButtonClick("right")}
          >
            {/* @ts-ignore */}
            <ChevronRight className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80" />
          </button>
        )}
      </div>
    </div>
  );
};

const FavoriteTabItem: FC<{
  currTab: FavoriteTab;
  setCurrTab: any;
  item: FavoriteTab;
  onClickDeleteTab: (item: FavoriteTab) => void;
  updateFavoriteTabs: (
    tab: FavoriteTab,
    operator: {
      add?: boolean;
      update?: boolean;
      delete?: boolean;
    }
  ) => void;
}> = (props) => {
  const { item, currTab, onClickDeleteTab } = props;
  const [editTab, setEditTab] = useState(false);
  const [text, setText] = useState(item.name);

  const elementRef = useRef(null);
  const [itemW, setItemW] = useState<number | null>(null);

  const handleDoubleClick = () => {
    setEditTab(true);
  };

  const handleBlur = () => {
    setEditTab(false);
    props.updateFavoriteTabs(
      { ...props.currTab, name: text },
      { update: true }
    );
    props.setCurrTab({ ...props.currTab, name: text });
    setItemW(null);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      setEditTab(false);
      props.updateFavoriteTabs(
        { ...props.currTab, name: text },
        { update: true }
      );
      props.setCurrTab({ ...props.currTab, name: text });
      setItemW(null);
    }
  };

  const handleChange = (event: any) => {
    setText(event.target.value);
  };

  const canDel = item.id !== 1 && item.id === props.currTab.id;

  useEffect(() => {
    if (elementRef.current) {
      // @ts-ignore
      const width = elementRef.current.getBoundingClientRect().width;
      setItemW(width + (item.id !== 1 ? 14 : 0));
    }
  }, []);

  return (
    <button
      ref={elementRef}
      className={cn(
        "orderly-flex orderly-items-center orderly-text-xs orderly-pl-3 orderly-rounded-t-lg orderly-bg-base-800 orderly-h-full orderly-text-base-contrast-54",
        props.currTab.id === item.id &&
          "orderly-bg-base-900 orderly-text-base-contrast"
      )}
      onClick={(e) => {
        props.setCurrTab(item);
      }}
      onDoubleClick={handleDoubleClick}
      style={itemW ? { width: `${itemW}px` } : {}}
    >
      {editTab ? (
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={!editTab}
          className="orderly-bg-transparent orderly-outline-none orderly-w-[calc(100%-30px)]"
        />
      ) : (
        item.name
      )}
      {canDel ? (
        <button
          onClick={() => onClickDeleteTab(item)}
          className="orderly-pl-1 orderly-pr-1"
        >
          {/* @ts-ignore */}
          <X size={14} />
        </button>
      ) : (
        <div
          className={cn(
            "orderly-pl-1 orderly-pr-1 orderly-w-[14px] orderly-h-full",
            item.id === 1 && "orderly-w-0"
          )}
        ></div>
      )}
    </button>
  );
};
