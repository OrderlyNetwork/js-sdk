import { useEffect, useMemo, useState } from "react";
import { useTradingPageContext } from "../../../provider/context";
import {
  useMediaQuery,
  useOrderbookStream,
  useOrderStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { removeTrailingZeros } from "@orderly.network/utils";
import { MEDIA_TABLET, OrderStatus } from "@orderly.network/types";
import { getBasicSymbolInfo } from "../../../utils/utils";

const CELL_MAX = 30;
const DEFAULT_CELL_HEIGHT = 20;

const SPACE = 104;

export const useOrderBookScript = (props: {
  symbol: string;
  tabletMediaQuery?: string;
  height?: number;
}) => {
  const { symbol, height, tabletMediaQuery = MEDIA_TABLET } = props;
  const symbolInfo = useSymbolsInfo()[props.symbol];

  const [cellHeight, setCellHeight] = useState(DEFAULT_CELL_HEIGHT);

  const [level, setLevel] = useState(10);
  const { base, quote, quote_dp } = getBasicSymbolInfo(symbolInfo);

  const [data, { onDepthChange, isLoading, onItemClick, depth, allDepths }] =
    useOrderbookStream(symbol, undefined, {
      level,
    });

  const pendingOrders = usePendingOrderStream(symbol);
  useEffect(() => {
    if (height) {
      //   setCellHeight(height.content / level);
      const level = Math.floor(
        (height - SPACE) / ((DEFAULT_CELL_HEIGHT + 1) * 2)
      );

      const cellsHeight = (DEFAULT_CELL_HEIGHT + 1) * 2 * level;

      const restSpace = height - SPACE - cellsHeight;

      // console.log(
      //   "restSpace",
      //   level,
      //   height,
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
  }, [height]);

  const selDepth = useMemo(() => {
    if (typeof depth === "undefined" || typeof quote_dp === "undefined") {
      return undefined;
    }

    let formattedNumber = removeTrailingZeros(depth);
    return formattedNumber;
  }, [depth, quote_dp]);

  const depths = useMemo(() => {
    return allDepths?.map((e) => removeTrailingZeros(e)) || [];
  }, [allDepths, quote_dp]);

  const isMWeb = useMediaQuery(tabletMediaQuery);

  return {
    level,
    asks: data?.asks,
    bids: data?.bids,
    markPrice: data?.markPrice,
    lastPrice: data?.middlePrice,
    depths,
    selDepth,
    base,
    quote,
    isLoading,
    onItemClick,
    cellHeight,
    onDepthChange,
    pendingOrders,
    symbolInfo: getBasicSymbolInfo(symbolInfo),
    isMWeb,
  };
};

export const usePendingOrderStream = (symbol: string): number[] => {
  const [data] = useOrderStream({
    status: OrderStatus.INCOMPLETE,
    symbol: symbol,
  });

  const pendingOrders = useMemo(() => {
    const info = data
      ?.filter((item) => item.symbol === symbol)
      .reduce((a, b) => {
        // TODO: check if this is the correct price, when the data is from WS, it crashes
        const price = b.price || b.trigger_price || 0;
        return [...a, price];
      }, []);

    return info;
  }, [data, symbol]);

  return pendingOrders;
};

export type OrderBookState = ReturnType<typeof useOrderBookScript>;
