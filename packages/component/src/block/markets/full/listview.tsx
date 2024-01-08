import { FC, ReactNode, forwardRef, useRef } from "react";
import { MarketListViewProps, SortDirection, SortKey } from "../shared/types";
import { API } from "@orderly.network/types";
import { ListView } from "@/listView";
import { Numeral, Text } from "@/text";
import { SortGroup } from "./sortGroup";
import { cn } from "@/utils/css";
import type { ListViewRef } from "@/listView/listView";

interface Props {
  activeIndex: number;
  onSort: (value: Partial<{ key: SortKey; direction: SortDirection }>) => void;

  maxHeight?: number;
  onItemClick?: (item: API.MarketInfoExt) => void;
  updateActiveIndex?: (index: number) => void;
}

export const ListViewFull = forwardRef<
  ListViewRef,
  MarketListViewProps & Props & { prefix?: React.ReactNode, suffix?: React.ReactNode }
>((props, ref) => {
  const renderItem = (
    item: API.MarketInfoExt,
    index: number,
    activeIndex: number
  ) => {
    return (
      <div
        onMouseEnter={() => {
          props.updateActiveIndex?.(index);
        }}
        className={cn(
          "orderly-grid orderly-grid-cols-4 orderly-py-3 orderly-px-5 orderly-cursor-pointer orderly-h-[46px]",
          {
            "orderly-bg-base-contrast/5": activeIndex === index,
            "orderly-grid-cols-5": props.suffix,
          }
        )}
        onClick={() => props.onItemClick?.(item)}
      >
        <div className="orderly-col-span-1 orderly-flex">
          {props.prefix && (props.prefix)}
          <Text rule="symbol">{item.symbol}</Text>
        </div>
        <div className="orderly-col-span-1 orderly-text-right">
          <Numeral>{item["24h_close"]}</Numeral>
        </div>
        <div className="orderly-col-span-1 orderly-text-right">
          <Numeral coloring rule="percentages" showIcon>
            {item?.change ?? 0}
          </Numeral>
        </div>
        <div className="orderly-col-span-1 orderly-text-right orderly-text-base-contrast-54">
          <Numeral.total
            rule="human"
            className="orderly-text-base-contrast-54"
            price={item["24h_close"]}
            quantity={item["24h_volumn"]}
          />
        </div>
        {props.suffix && (
          <div className="orderly-col-span-1 orderly-text-right orderly-text-base-contrast-54">
            {props.suffix}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <SortGroup onChange={props.onSort} hasSuffix={props.suffix !== undefined} />
      <ListView<API.MarketInfoExt, number>
        // @ts-ignore
        ref={ref}
        dataSource={props.dataSource}
        // @ts-ignore
        renderItem={renderItem}
        className="orderly-text-xs orderly-overflow-y-auto"
        contentClassName="orderly-space-y-0"
        extraData={props.activeIndex}
        style={props.maxHeight ? { maxHeight: `${props.maxHeight}px` } : {}}
      />
    </div>
  );
});
