import { FC, SVGProps, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DesktopOrderBookCell } from "./cell.desktop";
import { OrderBookContext } from "../orderContext";
import { OrderBookCellType, QtyMode } from "../types";

import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { SymbolContext } from "@/provider";
import { Numeral } from "@/text";

interface DesktopListBoxProps {
  type: OrderBookCellType;
  data: number[][];
  countQty: number;
}

export const DesktopListBox: FC<DesktopListBoxProps> = (props) => {
  const { data, type } = props;
  const { depth } = useContext(OrderBookContext);

  const { base, quote, base_dp, quote_dp } = useContext(SymbolContext);

  const findMaxItem = useCallback(() => {
    if ((data?.length || 0) === 0) {
      return null;
    }
    if (type ===  OrderBookCellType.ASK) {
      const index = data.findIndex((item) => !Number.isNaN(item[0]));
      if (index != -1) {
        return data[index];
      }
      return null;
    } else {
      for (let index = data.length-1; index>=0; index--) {
        const item = data[index];

        if (!Number.isNaN(item[0])) {
          return item;
        }
      }
      return null;
    }
  }, [data, type]);

  

  const priceDp = useMemo(() => {
    if (depth?.toString().includes(".")) {
      return depth.toString().split(".")[1].length;
    }
    return 0;
  }, [depth]);

  const maxQty = useMemo(() => {
    return data.reduce((a, b) => Math.max(a, b[1]), 0);
  }, [data]);
  const [hoverIndex, setHoverIndex] = useState<number>(-1);

  return <div
    id="orderly-order-book-list"
    className="orderly-flex orderly-flex-col orderly-gap-[1px]"
  >
    {data.map((item, index) => {
      return (
        <Tip
          key={index}
          index={index}
          item={item}
          countQty={props.countQty}
          setHoverIndex={setHoverIndex}
          hoverIndex={hoverIndex}
          type={type}
          maxQty={maxQty}
          base={base}
          quote={quote}
          priceDp={priceDp}
          baseDp={base_dp}
          quoteDp={quote_dp}
          findMaxItem={findMaxItem}
        />
      );
    })}
  </div>

};



const Tip: FC<{
  index: number,
  item: any,
  countQty: number,
  setHoverIndex: any,
  type: OrderBookCellType,
  maxQty: number,
  hoverIndex: number,
  base: any,
  quote: any,
  priceDp: number,
  baseDp: number,
  quoteDp: number,
  findMaxItem: () => number[] | null,
}> = (props) => {

  const { index, item, setHoverIndex, type, maxQty, hoverIndex, base, quote, priceDp, baseDp, quoteDp } = props;

  const isHover = hoverIndex !== -1 ? (
    type === OrderBookCellType.ASK ?
      index >= hoverIndex :
      index <= hoverIndex
  ) : false;

  const [open, setOpen] = useState(false);

  const calcHintInfo = (item: any): {
    avgPrice: number;
    sumQty: number;
    sumQtyAmount: number;
  } => {

    if (item === null) {
      return {
        sumQty: 0,
        sumQtyAmount: 0,
        avgPrice: 0,
      };
    }
    let totalInfo = { sumQty: 0, sumQtyAmount: 0 };
    if (!Number.isNaN(item[2])) {
      totalInfo = {
        sumQty: item[2],
        sumQtyAmount: item[3]
      };
    }


    return {
      ...totalInfo,
      avgPrice: totalInfo.sumQtyAmount == 0 ? 0 : totalInfo.sumQtyAmount / totalInfo.sumQty
    };

  };
  let hintInfo = calcHintInfo(item);
  if (hintInfo.avgPrice === 0) {
    hintInfo = calcHintInfo(props.findMaxItem());
  }

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger>
        <DesktopOrderBookCell
          background={""}
          price={item[0]}
          quantity={item[1]}
          accumulated={item[2]}
          count={props.countQty}
          type={props.type}
          accumulatedAmount={item[3]}
          maxQty={maxQty}
          isHover={isHover}
          onMouseEnter={() => {
            setHoverIndex(index);
            setOpen(true);
          }}
          onMouseLeave={() => {
            setHoverIndex(-1);
            setOpen(false);
          }}
        />
      </TooltipTrigger>
      <TooltipContent
        className="orderly-max-w-[400px] orderly-w-full orderly-text-3xs orderly-shadow-md orderly-rounded orderly-p-3 orderly-bg-base-700 orderly-animate-in orderly-fade-in-0 orderly-zoom-in-95 data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=closed]:orderly-zoom-out-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2"
        align="center"
        side="left"
        sideOffset={12}
        onPointerEnter={(e) => e.preventDefault()}
      >

        <Row title="Avg. Price≈" content={hintInfo.avgPrice} contentDp={priceDp} />
        <Row title={`Sum (${base})`} content={hintInfo.sumQty} contentDp={baseDp} />
        <Row title={`Sum (${quote})`} content={hintInfo.sumQtyAmount} contentDp={quoteDp} />

        <TooltipArrow className="orderly-fill-base-700" />

      </TooltipContent>
    </Tooltip>
  );
}


const Row: FC<{ title: string, content: number, contentDp: number }> = (props) => {
  const { title, content, contentDp } = props;

  return (
    <div className="orderly-flex orderly-flex-row orderly-justify-between orderly-gap-4">
      <div className="orderly-text-base-contrast-36">
        {title}
      </div>
      <div className="orderly-text-right">
        <Numeral precision={contentDp}>
          {content}
        </Numeral>
      </div>
    </div>
  );

}