import { FC, useEffect, useRef, useState } from "react";
import { ListViewFull } from "./listview";
import { MarketsType, useMarkets, FavoriteTab } from "@orderly.network/hooks";
import { useDataSource } from "../useDataSource";
import { API } from "@orderly.network/types";
import { CircleAdd } from "@/icon";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/utils";
import { modal } from "@/modal";

export const FavoritesTabPane: FC<{
    onClose?: () => void,
    maxHeight: number | undefined,
    activeIndex: number,
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
    fitlerKey: string,
    onItemClick?: (symbol: API.Symbol) => void,
}> = (props) => {
    const { activeIndex, setActiveIndex, onItemClick, fitlerKey } = props;

    const [data, { addToHistory, favoriteTabs, updateFavoriteTabs, updateSymbolFavoriteState, }] = useMarkets(MarketsType.FAVORITES);
    const [currTab, setCurrTab] = useState(favoriteTabs[0]);
    const [dataSource, { onSearch, onSort }] = useDataSource(
        data
    );


    useEffect(() => {
        onSearch(fitlerKey);
    }, [fitlerKey]);

    return (<div>
        <FavoritesTabList
            currTab={currTab}
            setCurrTab={setCurrTab}
            tabs={favoriteTabs}
            updateFavoriteTabs={updateFavoriteTabs}
            updateSymbolFavoriteState={updateSymbolFavoriteState}
        />
        <ListViewFull
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
        />
    </div>);
}

const FavoritesTabList: FC<{
    currTab: FavoriteTab,
    setCurrTab: any,
    tabs: FavoriteTab[],
    updateSymbolFavoriteState: (symbol: API.MarketInfoExt, tab: FavoriteTab, del?: boolean) => void
    updateFavoriteTabs: (tab: FavoriteTab, operator: {
        add?: boolean;
        update?: boolean;
        delete?: boolean;
    }) => void
}> = (props) => {
    const [leadingVisible, setLeadingVisible] = useState(false);
    const [tailingVisible, setTailingVisible] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const leadingElementRef = useRef<HTMLDivElement>(null);
    const tailingElementRef = useRef<HTMLDivElement>(null);

    console.log("currTab", props.currTab, props.tabs);





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

    const onScollButtonClick = (direction: string) => {
        if (direction === "left")
            containerRef.current?.scrollBy({ left: -100, behavior: "smooth" });
        else containerRef.current?.scrollBy({ left: 100, behavior: "smooth" });
    };

    const onClickDeleteTab = (tab: FavoriteTab) => {
        modal.confirm(
            {
                title: "Are you sure you want to delete this watchlist?",
                content: (
                    <div className="orderly-text-base-contrast-54 orderly-text-2xs">
                        {/* Are you sure you want to delete this watchlist? */}
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
                    props.setCurrTab(props.tabs[index]);


                },
            }
        );
    };





    return (<div className="orderly-h-[58px] orderly-bg-base-800 orderly-w-full orderly-flex orderly-items-center">
        <button
            className=" orderly-px-4 orderly-h-[58px] orderly-flex orderly-items-center orderly-fill-base-contrast-36 hover:orderly-fill-base-contrast"
            onClick={(e) => {
                const newTab = { name: `WatchList_${props.tabs.length}`, id: Date.now() };
                props.updateFavoriteTabs(newTab, { add: true });
                props.setCurrTab(newTab);
            }}
        >
            <CircleAdd size={24} fill="current" />
        </button>
        <div className="orderly-relative orderly-overflow-hidden orderly-h-full orderly-w-full orderly-bg-base-800" >

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
            {
                leadingVisible && <button className="orderly-flex-1"
                    onClick={() => onScollButtonClick("left")}>
                    {/* @ts-ignore */}
                    <ChevronLeft className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80" />
                </button>
            }
            {
                tailingVisible && <button
                    className="orderly-flex-1"
                    onClick={() => onScollButtonClick("right")}
                >
                    {/* @ts-ignore */}
                    <ChevronRight className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80" />
                </button>
            }
        </div>
    </div>);

}

const FavoriteTabItem: FC<{
    currTab: FavoriteTab,
    setCurrTab: any,
    item: FavoriteTab,
    onClickDeleteTab: (item: FavoriteTab) => void,
    updateFavoriteTabs: (tab: FavoriteTab, operator: {
        add?: boolean;
        update?: boolean;
        delete?: boolean;
    }) => void
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
        props.updateFavoriteTabs({ ...props.currTab, name: text }, { update: true });
        props.setCurrTab({ ...props.currTab, name: text });
    };

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            setEditTab(false);
            props.updateFavoriteTabs({ ...props.currTab, name: text }, { update: true });
            props.setCurrTab({ ...props.currTab, name: text });
        }
    };

    const handleChange = (event: any) => {
        setText(event.target.value);
    };

    const canDel = (item.id !== 1 && item.id === props.currTab.id);

    useEffect(() => {
        if (elementRef.current) {
          const width = elementRef.current.getBoundingClientRect().width;
          console.log('Element width:', width);
          setItemW(width + (item.id !== 1 ? 12 : 0));
        }
      }, []);

    return (
        <button
            ref={elementRef}
            className={cn(
                "orderly-flex orderly-items-center orderly-text-xs orderly-pl-3 orderly-rounded-t-lg orderly-bg-base-800 orderly-h-full orderly-text-base-contrast-54",
                props.currTab.id === item.id && "orderly-bg-base-900 orderly-text-base-contrast",
            )
            }
            onClick={(e) => {
                props.setCurrTab(item);
            }}
            onDoubleClick={handleDoubleClick}
            style={itemW ? {width: `${itemW}px`} : {}}
        >
            {
                editTab ?
                    <input
                        type="text"
                        value={text}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        disabled={!editTab}
                        className="orderly-bg-transparent orderly-outline-none"
                        style={ itemW ? {width: `${itemW - 40}px`}: {}}
                    /> : item.name
            }
            {canDel ?
                <button onClick={() => onClickDeleteTab(item)} className="orderly-pl-1 orderly-pr-1">
                    {/* @ts-ignore */}
                    <X size={14} />
                </button> :
                <div className="orderly-pl-1 orderly-pr-1 orderly-w-[14px] orderly-h-full"></div>}

        </button>
    );
}