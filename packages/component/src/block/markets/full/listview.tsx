import { FC, ReactNode, forwardRef, useRef } from "react";
import { MarketListViewProps, SortDirection, SortKey } from "../shared/types";
import { API } from "@orderly.network/types";
import { ListView } from "@/listView";
import { Numeral, Text } from "@/text";
import { SortGroup } from "./sortGroup";
import { cn } from "@/utils/css";
import type { ListViewRef } from "@/listView/listView";
import { NetworkImage } from "@/icon";
import { useSymbolsInfo } from "@orderly.network/hooks";

interface Props {
  activeIndex: number;
  onSort: (value: Partial<{ key: SortKey; direction: SortDirection }>) => void;
  readLastSortCondition?: boolean;
  maxHeight?: number;
  onItemClick?: (item: API.MarketInfoExt) => void;
  updateActiveIndex?: (index: number) => void;
  favoriteTabs: any;
}

export const ListViewFull = forwardRef<
  ListViewRef,
  MarketListViewProps &
    Props & {
      prefixRender?: (
        item: API.MarketInfoExt,
        index: number
      ) => React.ReactNode;
      suffixRender?: (
        item: API.MarketInfoExt,
        index: number
      ) => React.ReactNode;
    }
>((props, ref) => {
  const config = useSymbolsInfo();

  const renderItem = (
    item: API.MarketInfoExt,
    index: number,
    extraData: any
  ) => {
    if (config.isNil) return null;
    const symbolInfo = config?.[item.symbol];
    const baseDp = symbolInfo("quote_dp", 2);
    return (
      <div
        onMouseEnter={() => {
          props.updateActiveIndex?.(index);
        }}
        className={cn(
          "orderly-grid orderly-grid-cols-5 orderly-py-3 orderly-px-5 orderly-cursor-pointer orderly-h-[46px] hover:orderly-bg-base-800",
          {
            "orderly-bg-base-contrast/5": extraData === index,
            "orderly-grid-cols-6": props.suffixRender,
          }
        )}
        onClick={() => props.onItemClick?.(item)}
      >
        <div className="orderly-col-span-2 orderly-flex orderly-items-center">
          {props.prefixRender && props.prefixRender(item, extraData)}
          <NetworkImage
            type="symbol"
            symbol={item.symbol}
            size={"small"}
            className="orderly-mr-2"
          />
          <Text rule="symbol">{item.symbol}</Text>
          {/* @ts-ignore */}
          {item.leverage && (
            <div className="orderly-ml-1 orderly-rounded-sm orderly-px-1 orderly-py-[2px] orderly-flex orderly-items-center orderly-text-3xs orderly-text-primary orderly-bg-base-600">
              {/* @ts-ignore */}
              {`${item.leverage}x`}
            </div>
          )}
        </div>
        <div className="orderly-col-span-1 orderly-text-right">
          <Numeral precision={baseDp}>{item["24h_close"]}</Numeral>
        </div>
        <div className="orderly-col-span-1 orderly-text-right">
          <Numeral coloring rule="percentages" showIcon icons={{
            loss: (<div>-</div>),
            profit: (<div>+</div>)
          }}>
            {item?.change ?? 0}
          </Numeral>
        </div>
        <div className="orderly-col-span-1 orderly-text-right orderly-text-base-contrast-54">
          {/* <Numeral.total
            rule="human"
            className="orderly-text-base-contrast-54"
            price={item["24h_close"]}
            quantity={item["24h_volume"]}
          /> */}
          <Numeral rule="human" className="orderly-text-base-contrast-54">
            {item?.["24h_amount"]}
          </Numeral>
        </div>
        {props.suffixRender && (
          <div className="orderly-col-span-1 orderly-text-right orderly-text-base-contrast-54">
            {props.suffixRender(item, index)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <SortGroup
        readLastSortCondition={props.readLastSortCondition}
        onChange={props.onSort}
        hasSuffix={props.suffixRender !== undefined}
      />
      <ListView<API.MarketInfoExt, any>
        // @ts-ignore
        ref={ref}
        dataSource={props.dataSource}
        // @ts-ignore
        renderItem={renderItem}
        className="orderly-text-xs orderly-overflow-y-auto orderly-bg-base-900"
        contentClassName="orderly-space-y-0"
        // extraData={props.activeIndex}
        extraData={props.favoriteTabs}
        style={props.maxHeight ? { height: `${props.maxHeight}px` } : {}}
      />
    </div>
  );
});
