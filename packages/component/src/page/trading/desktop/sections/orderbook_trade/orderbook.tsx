import { DesktopOrderBook } from "@/block/orderbook/desktop/index.desktop";
import { SymbolProvider } from "@/provider";
import { useSymbolContext } from "@/provider/symbolProvider";
import { useTabContext } from "@/tab/tabContext";
import { cn } from "@/utils/css";
import {
  useOrderbookStream,
  useSymbolsInfo,
  useEventEmitter,
} from "@orderly.network/hooks";
import { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import { usePendingOrderStream } from "./usePendingOrderStream";
import { Decimal, removeTrailingZeros } from "@orderly.network/utils";

interface MyOrderBookProps {
  symbol: string;
  className?: string;
}

const CELL_MAX = 30;
const DEFAULT_CELL_HEIGHT = 20;

const SPACE = 104;

export const MyOrderBook: FC<MyOrderBookProps> = (props) => {
  const { symbol } = props;
  const [cellHeight, setCellHeight] = useState(DEFAULT_CELL_HEIGHT);

  const [level, setLevel] = useState(10);
  const { base, quote, quote_dp } = useSymbolContext();

  const [data, { onDepthChange, isLoading, onItemClick, depth, allDepths }] =
    useOrderbookStream(symbol, undefined, {
      level,
    });

  const pendingOrders = usePendingOrderStream(symbol);

  const { height } = useTabContext();

  useEffect(() => {
    if (height?.content) {
      //   setCellHeight(height.content / level);
      const level = Math.floor(
        (height.content - SPACE) / ((DEFAULT_CELL_HEIGHT + 1) * 2)
      );

      const cellsHeight = (DEFAULT_CELL_HEIGHT + 1) * 2 * level;

      const restSpace = height.content - SPACE - cellsHeight;

      // console.log(
      //   "restSpace",
      //   level,
      //   height.content,
      //   SPACE,
      //   cellsHeight,
      //   restSpace
      // );

      if (restSpace > 10) {
        setCellHeight(DEFAULT_CELL_HEIGHT + restSpace / level / 2);
      } else {
        setCellHeight(DEFAULT_CELL_HEIGHT);
      }

      setLevel(level);
    }
  }, [height?.content]);

  


    const selDepth = useMemo(() => {

      if (typeof depth === 'undefined' || typeof quote_dp === 'undefined') {
        return undefined;
      }

      let formattedNumber = removeTrailingZeros(depth);
      return formattedNumber;
    }, [depth, quote_dp]);


    const depths = useMemo(() => {
      return allDepths?.map((e) => (removeTrailingZeros(e))) || [];
    }, [allDepths,quote_dp]);

  return (
    <DesktopOrderBook
      level={level}
      asks={data.asks!}
      bids={data.bids!}
      markPrice={data.markPrice!}
      lastPrice={data.middlePrice!}
      depth={depths}
      activeDepth={selDepth}
      base={base}
      quote={quote}
      isLoading={isLoading}
      onItemClick={onItemClick}
      cellHeight={cellHeight}
      onDepthChange={onDepthChange}
      className={props.className}
      pendingOrders={pendingOrders}
    />
  );
};

export const MemorizedOrderBook = memo(MyOrderBook);
