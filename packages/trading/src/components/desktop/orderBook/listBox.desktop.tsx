import { FC, useCallback, useMemo, useState } from "react";
import { DesktopOrderBookCell } from "./cell.desktop";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Text,
  Flex,
  TooltipRoot,
  TooltipArrow,
  cn,
} from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { OrderBookCellType } from "../../base/orderBook/types";
import { useOrderBookContext } from "../../base/orderBook/orderContext";

interface DesktopListBoxProps {
  type: OrderBookCellType;
  data: number[][];
  countQty: number;
}

export const DesktopListBox: FC<DesktopListBoxProps> = (props) => {
  const { data, type } = props;
  const { symbolInfo, depth } = useOrderBookContext();

  const findMaxItem = useCallback(() => {
    if ((data?.length || 0) === 0) {
      return null;
    }
    if (type === OrderBookCellType.ASK) {
      const index = data.findIndex((item) => !Number.isNaN(item[0]));
      if (index != -1) {
        return data[index];
      }
      return null;
    } else {
      for (let index = data.length - 1; index >= 0; index--) {
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

  return (
    <div
      id="oui-order-book-list"
      className="oui-flex oui-flex-col oui-gap-[1px]"
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
            priceDp={priceDp}
            symbolInfo={symbolInfo}
            findMaxItem={findMaxItem}
          />
        );
      })}
    </div>
  );
};

const Tip: FC<{
  index: number;
  item: any;
  countQty: number;
  setHoverIndex: any;
  type: OrderBookCellType;
  maxQty: number;
  hoverIndex: number;
  priceDp: number;
  // base: any;
  // quote: any;
  // baseDp: number;
  // quoteDp: number;
  findMaxItem: () => number[] | null;
  symbolInfo: BasicSymbolInfo;
}> = (props) => {
  const {
    index,
    item,
    setHoverIndex,
    type,
    maxQty,
    hoverIndex,
    priceDp,

    symbolInfo,
  } = props;

  const { base, quote, base_dp: baseDp, quote_dp: quoteDp } = symbolInfo;

  const isHover =
    hoverIndex !== -1
      ? type === OrderBookCellType.ASK
        ? index >= hoverIndex
        : index <= hoverIndex
      : false;

  const [open, setOpen] = useState(false);

  const calcHintInfo = (
    item: any
  ): {
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
        sumQtyAmount: item[3],
      };
    }

    return {
      ...totalInfo,
      avgPrice:
        totalInfo.sumQtyAmount == 0
          ? 0
          : totalInfo.sumQtyAmount / totalInfo.sumQty,
    };
  };
  let hintInfo = calcHintInfo(item);
  if (hintInfo.avgPrice === 0) {
    hintInfo = calcHintInfo(props.findMaxItem());
  }

  return (
    <TooltipRoot open={open} onOpenChange={setOpen}>
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
          currentHover={hoverIndex === index}
          symbolInfo={symbolInfo}
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
        className={cn(
          "oui-max-w-[400px] oui-w-full oui-text-2xs oui-shadow-md oui-rounded-base oui-p-3 oui-bg-base-6 oui-flex oui-flex-col oui-gap-2",
          // type === OrderBookCellType.ASK ? `oui-mb-${30}` : "oui-mt-0"
        )}
        align={
          type === OrderBookCellType.ASK ? "end" : "start"
        }
        alignOffset={-25.4}
        side="left"
        sideOffset={2}
        onPointerEnter={(e) => e.preventDefault()}
      >
        <Row
          title="Avg. Price≈"
          content={hintInfo.avgPrice}
          contentDp={priceDp}
        />
        <Row
          title={`Sum (${base})`}
          content={hintInfo.sumQty}
          contentDp={baseDp}
        />
        <Row
          title={`Sum (${quote})`}
          content={hintInfo.sumQtyAmount}
          contentDp={quoteDp}
        />

        <TooltipArrow
          className="oui-fill-base-6"
          style={{
            transform:
              type === OrderBookCellType.ASK
                ? "translateX(80%)"
                : "translateX(-80%)",
          }}
        />
      </TooltipContent>
    </TooltipRoot>
  );
};

const Row: FC<{ title: string; content: number; contentDp: number }> = (
  props
) => {
  const { title, content, contentDp } = props;

  return (
    <div className="oui-flex oui-flex-row oui-justify-between oui-gap-4">
      <div className="oui-text-base-contrast-36">{title}</div>
      <div className="oui-text-right">
        <Text.numeral dp={contentDp}>{content}</Text.numeral>
      </div>
    </div>
  );
};
