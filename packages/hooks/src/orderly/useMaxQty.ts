import { useMemo } from "react";
import { account } from "@orderly.network/perp";
import { type API, OrderSide } from "@orderly.network/types";
import { useAccountInfo } from "./appStore";
import { useCollateral } from "./useCollateral";
import { useLeverageBySymbol } from "./useLeverageBySymbol";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { usePositions } from "./usePositionStream/usePosition.store";
import { useSymbolLeverage } from "./useSymbolLeverage";
import { useSymbolsInfo } from "./useSymbolsInfo";

// const positionsPath = pathOr([], [0, "rows"]);

/**
 * A hook that calculates the maximum tradeable quantity for a given symbol and side
 * @returns Maximum tradeable quantity
 * @example
 * ```tsx
 * // Get max buy quantity for BTC
 * const maxBuyQty = useMaxQty("PERP_BTC_USDC", OrderSide.BUY);
 *
 * // Get max sell quantity with reduce only
 * const maxSellQty = useMaxQty("PERP_BTC_USDC", OrderSide.SELL, true);
 * ```
 */
export const useMaxQty = (
  /**
   * Trading pair symbol (e.g. "PERP_BTC_USDC")
   * */
  symbol: string,
  /**
   * Order side ("BUY" or "SELL")
   * */
  side: OrderSide,
  /**
   * Executes buy or sell orders which only reduce a current position.
   *
   * If true, only allows orders that reduce current position
   * */
  reduceOnly: boolean = false,
) => {
  const positions = usePositions();

  const accountInfo = useAccountInfo();

  const symbolInfo = useSymbolsInfo();

  const { totalCollateral } = useCollateral();

  const { data: markPrices } = useMarkPricesStream();

  const symbolLeverage = useLeverageBySymbol(symbol);

  // const [orders] = useOrderStream({ status: OrderStatus.NEW });

  const maxQty = useMemo(() => {
    if (!symbol) return 0;

    // const positions = positionsPath(positionsData);

    const positionQty = account.getQtyFromPositions(
      positions === null ? [] : positions,
      symbol,
    );
    /**
     * Reduce-only mode handling:
     * For long positions (positionQty > 0):
     * - Buy orders return 0 (cannot increase long position)
     * - Sell orders return absolute position quantity (can close long position)
     * For short positions (positionQty < 0):
     * - Buy orders return absolute position quantity (can close short position)
     * - Sell orders return 0 (cannot increase short position)
     */
    if (reduceOnly) {
      if (positionQty > 0) {
        if (side === OrderSide.BUY) {
          return 0;
        } else {
          return Math.abs(positionQty);
        }
      }

      if (positionQty < 0) {
        if (side === OrderSide.BUY) {
          return Math.abs(positionQty);
        } else {
          return 0;
        }
      }

      return 0;
    }

    if (!markPrices || !markPrices[symbol] || !accountInfo || !positions)
      return 0;

    const getSymbolInfo = symbolInfo[symbol];

    // const filterAlgoOrders = orders.filter(
    //   (item) =>
    //     item.algo_order_id === undefined || item.algo_type === "BRACKET",
    // );

    const currentSymbolPosition = positions.find(
      (item) => item.symbol === symbol,
    );

    // current symbol buy order quantity
    const buyOrdersQty = currentSymbolPosition?.pending_long_qty ?? 0;
    // current symbol sell order quantity
    const sellOrdersQty = currentSymbolPosition?.pending_short_qty ?? 0;

    const otherPositions = !Array.isArray(positions)
      ? []
      : positions.filter((item: API.Position) => item.symbol !== symbol);

    const otherIMs = account.otherIMs({
      positions: otherPositions,
      symbolInfo,
      markPrices,
      IMR_Factors: accountInfo.imr_factor,
      maxLeverage: accountInfo.max_leverage,
    });

    return account.maxQty(side, {
      markPrice: markPrices[symbol],
      symbol,
      baseMaxQty: getSymbolInfo("base_max"),
      totalCollateral,
      maxLeverage: account.maxLeverage({
        symbolLeverage: symbolLeverage || currentSymbolPosition?.leverage,
        accountLeverage: accountInfo.max_leverage,
      }),
      takerFeeRate: accountInfo.futures_taker_fee_rate,
      baseIMR: getSymbolInfo("base_imr"),
      otherIMs,
      positionQty,
      buyOrdersQty,
      sellOrdersQty,
      IMR_Factor: accountInfo.imr_factor[symbol],
    });
  }, [
    symbol,
    positions,
    reduceOnly,
    markPrices,
    accountInfo,
    symbolInfo,
    side,
    totalCollateral,
  ]);

  // console.log("+++++++++++maxQty++++++++++++++ ", maxQty);
  // return 0;

  return Math.max(maxQty, 0) as number;
};
