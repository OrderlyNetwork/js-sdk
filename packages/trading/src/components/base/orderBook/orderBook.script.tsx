import { useEffect, useMemo, useState } from "react";
import {
  useOrderbookStream,
  useOrderStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { OrderStatus } from "@orderly.network/types";
import { useScreen } from "@orderly.network/ui";
import { removeTrailingZeros } from "@orderly.network/utils";
import { getBasicSymbolInfo } from "../../../utils/utils";

const CELL_MAX = 30;
const DEFAULT_CELL_HEIGHT = 20;

const SPACE = 104;

export const useOrderBookScript = (props: {
  symbol: string;
  height?: number;
}) => {
  const { symbol, height } = props;
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
        (height - SPACE) / ((DEFAULT_CELL_HEIGHT + 1) * 2),
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
    // FIXME: hardcode for now, need to optimize it
    if (symbol === "PERP_BTC_USDC") {
      return "1";
    }

    if (symbol === "PERP_ETH_USDC") {
      return "0.1";
    }

    return removeTrailingZeros(depth);
  }, [depth, quote_dp, symbol]);

  const depths = useMemo(() => {
    return allDepths?.map((e) => removeTrailingZeros(e)) || [];
  }, [allDepths, quote_dp]);

  const { isMobile } = useScreen();

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
    isMobile,
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
