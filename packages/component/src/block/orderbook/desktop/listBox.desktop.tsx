import { FC, useContext, useMemo } from "react";
import { DesktopOrderBookCell } from "./cell.desktop";
import { OrderBookContext } from "../orderContext";
import { OrderBookCellType } from "../types";

import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { SymbolContext } from "@/provider";
import { Numeral } from "@/text";

interface DesktopListBoxProps {
  type: OrderBookCellType;
  data: number[][];
  countQty: number;
}

export const DesktopListBox: FC<DesktopListBoxProps> = (props) => {
  const { data } = props;
  const { mode, depth } = useContext(OrderBookContext);

  const { base, quote, base_dp, quote_dp } = useContext(SymbolContext);

  const hintInfo = useMemo(() => {

    const totalInfo = data.reduce((a, b) => {
      const { sumQty, sumQtyAmount } = a;
      const [price, qty] = b;

      const p = Number.isNaN(price) ? 0 : (price);
      const q = Number.isNaN(qty) ? 0 : (qty);

      return {
        sumQty: sumQty + q,
        sumQtyAmount: sumQtyAmount + (p * q)
      };
    },
      { sumQty: 0, sumQtyAmount: 0 }
    );

    return {
      ...totalInfo,
      avgPrice: totalInfo.sumQtyAmount == 0 ? 0 : totalInfo.sumQtyAmount / totalInfo.sumQty
    };

  }, [data]);

  const priceDp = useMemo(() => {
    if (depth?.toString().includes(".")) {
      return depth.toString().split(".")[1].length;
    }
    return 0;
  }, [depth]);

  const maxQty = useMemo(() => {
    return data.reduce((a, b) => Math.max(a, b[1]), 0);
  }, [data]);

  return (
    <Tooltip defaultOpen={true} open={true}>
      <TooltipTrigger asChild>
        <div
          id="orderly-order-book-list"
          className="orderly-flex orderly-flex-col orderly-gap-[1px]"
        >
          {data.map((item, index) => {
            return (
              <DesktopOrderBookCell
                key={index}
                background={""}
                price={item[0]}
                quantity={item[1]}
                accumulated={item[2]}
                count={props.countQty}
                type={props.type}
                mode={mode}
                accumulatedAmount={item[3]}
                maxQty={maxQty}
              />
            );
          })}
        </div>
      </TooltipTrigger>
      <TooltipContent
        className="orderly-max-w-[400px] orderly-z-50 orderly-overflow-hidden orderly-rounded orderly-bg-base-700 orderly-p-3 orderly-text-3xs orderly-shadow-md orderly-animate-in orderly-fade-in-0 orderly-zoom-in-95 data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=closed]:orderly-zoom-out-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2"
        align="center"
        side="left"
        // alignOffset={-300}
        sideOffset={10}
        onPointerEnter={(e) => e.preventDefault()}
      >

        <Row title="Avg. Price≈" content={hintInfo.avgPrice} contentDp={priceDp} />
        <Row title={`Sum (${base})`} content={hintInfo.sumQty} contentDp={base_dp} />
        <Row title={`Sum (${quote})`} content={hintInfo.sumQtyAmount} contentDp={quote_dp} />

        <TooltipArrow
          width={11}
          height={11}
          className="orderly-fill-base-700"
        />
      </TooltipContent>
    </Tooltip>
  );
};


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