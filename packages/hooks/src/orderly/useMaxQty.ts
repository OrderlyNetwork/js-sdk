import { useMemo } from "react";
import { account, positions as positionsPerp } from "@orderly.network/perp";
import { type API, MarginMode, OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { useAccountInfo } from "./appStore";
import { useCollateral } from "./useCollateral";
import { useLeverageBySymbol } from "./useLeverageBySymbol";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { usePositions } from "./usePositionStream/usePosition.store";
import { useSymbolsInfo } from "./useSymbolsInfo";

/**
 * Options for useMaxQty hook
 */
export interface UseMaxQtyOptions {
  /**
   * Executes buy or sell orders which only reduce a current position.
   * If true, only allows orders that reduce current position
   * @default false
   */
  reduceOnly?: boolean;
  /**
   * Margin mode ("CROSS" or "ISOLATED")
   * @default MarginMode.CROSS
   */
  marginMode?: MarginMode;
  /**
   * Optional reference price for the **new order** when using isolated margin.
   *
   * If provided, this value will be used as `currentOrderReferencePrice`
   * in the isolated-margin max quantity formula instead of the mark price.
   * When omitted, the hook will fall back to `markPrice`.
   */
  currentOrderReferencePrice?: number;
}

/**
 * A hook that calculates the maximum tradeable quantity for a given symbol and side
 * @returns Maximum tradeable quantity
 * @example
 * ```tsx
 * // Get max buy quantity for BTC (backward compatible)
 * const maxBuyQty = useMaxQty("PERP_BTC_USDC", OrderSide.BUY);
 *
 * // Get max sell quantity with reduce only (backward compatible)
 * const maxSellQty = useMaxQty("PERP_BTC_USDC", OrderSide.SELL, true);
 *
 * // New object parameter style (recommended)
 * const maxQty = useMaxQty("PERP_BTC_USDC", OrderSide.BUY, {
 *   reduceOnly: false,
 *   marginMode: MarginMode.ISOLATED,
 * });
 *
 * // Only specify marginMode without reduceOnly
 * const maxQty = useMaxQty("PERP_BTC_USDC", OrderSide.BUY, {
 *   marginMode: MarginMode.ISOLATED,
 * });
 * ```
 */
export function useMaxQty(
  symbol: string,
  side: OrderSide,
  reduceOnly?: boolean,
  marginMode?: MarginMode,
): number;
export function useMaxQty(
  symbol: string,
  side: OrderSide,
  options?: UseMaxQtyOptions,
): number;
export function useMaxQty(
  /**
   * Trading pair symbol (e.g. "PERP_BTC_USDC")
   */
  symbol: string,
  /**
   * Order side ("BUY" or "SELL")
   */
  side: OrderSide,
  /**
   * Either reduceOnly boolean (backward compatible) or options object (recommended)
   */
  reduceOnlyOrOptions?: boolean | UseMaxQtyOptions,
  /**
   * Margin mode (only used when reduceOnlyOrOptions is boolean, for backward compatibility)
   */
  marginMode?: MarginMode,
): number {
  // Normalize parameters: handle both old (positional) and new (object) API
  const reduceOnly: boolean =
    typeof reduceOnlyOrOptions === "object" && reduceOnlyOrOptions !== null
      ? (reduceOnlyOrOptions.reduceOnly ?? false)
      : (reduceOnlyOrOptions ?? false);

  const finalMarginMode: MarginMode =
    typeof reduceOnlyOrOptions === "object" && reduceOnlyOrOptions !== null
      ? (reduceOnlyOrOptions.marginMode ?? MarginMode.CROSS)
      : (marginMode ?? MarginMode.CROSS);

  const positions = usePositions();

  const accountInfo = useAccountInfo();

  const symbolInfo = useSymbolsInfo();

  const { totalCollateral, usdcHolding, unsettledPnL } = useCollateral();

  const { data: markPrices } = useMarkPricesStream();

  const symbolLeverage = useLeverageBySymbol(symbol, finalMarginMode);

  const maxQty = useMemo(() => {
    // Early return for invalid symbol
    if (!symbol) return 0;

    // Early return if required data is not available
    if (!markPrices || !markPrices[symbol] || !accountInfo || !positions) {
      return 0;
    }

    const positionsArray = (positions === null ? [] : positions).filter(
      (position) => position.margin_mode === finalMarginMode,
    );
    const positionQty = account.getQtyFromPositions(positionsArray, symbol);

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
      if (positionQty === 0) return 0;
      // For long position: BUY returns 0, SELL returns positionQty
      // For short position: BUY returns |positionQty|, SELL returns 0
      return side === OrderSide.BUY
        ? positionQty < 0
          ? Math.abs(positionQty)
          : 0
        : positionQty > 0
          ? positionQty
          : 0;
    }

    const getSymbolInfo = symbolInfo[symbol];

    // Find current symbol position and filter other positions in a single pass
    let currentSymbolPosition: API.Position | undefined;
    const otherPositions: API.Position[] = [];

    for (const position of positionsArray) {
      if (position.symbol === symbol) {
        currentSymbolPosition = position;
      } else {
        otherPositions.push(position);
      }
    }

    // Extract common parameters used by both maxQty and maxQtyForIsolatedMargin
    const markPrice = markPrices[symbol];

    const baseIMR = getSymbolInfo("base_imr") ?? 0;
    const IMR_Factor = accountInfo.imr_factor[symbol] ?? 0;
    const leverage = symbolLeverage || currentSymbolPosition?.leverage || 1;

    // current symbol buy/sell order quantities
    const buyOrdersQty = currentSymbolPosition?.pending_long_qty ?? 0;
    const sellOrdersQty = currentSymbolPosition?.pending_short_qty ?? 0;

    if (finalMarginMode === MarginMode.ISOLATED) {
      const availableBalance = account.availableBalanceForIsolatedMargin({
        USDCHolding: usdcHolding,
        totalCrossUnsettledPnL: unsettledPnL ?? 0,
        freeCollateral: totalCollateral,
      });
      // Build pending orders arrays (only if quantity > 0)
      // Use mark price as reference price (since we don't have actual order prices)
      const pendingLongOrders: Array<{
        referencePrice: number;
        quantity: number;
      }> =
        buyOrdersQty > 0
          ? [{ referencePrice: markPrice, quantity: buyOrdersQty }]
          : [];

      const pendingSellOrders: Array<{
        referencePrice: number;
        quantity: number;
      }> =
        sellOrdersQty > 0
          ? [{ referencePrice: markPrice, quantity: sellOrdersQty }]
          : [];

      // Calculate frozen margins for pending orders: isoOrderFrozen = (order_notional / leverage)
      // Reuse Decimal instance for better performance
      const markPriceDecimal = new Decimal(markPrice);
      const leverageDecimal = new Decimal(leverage);
      const isoOrderFrozenLong =
        buyOrdersQty > 0
          ? markPriceDecimal.mul(buyOrdersQty).div(leverageDecimal).toNumber()
          : 0;

      const isoOrderFrozenShort =
        sellOrdersQty > 0
          ? markPriceDecimal.mul(sellOrdersQty).div(leverageDecimal).toNumber()
          : 0;

      // Get or calculate symbolMaxNotional
      // Priority: accountInfo.max_notional[symbol] > calculated maxPositionNotional
      const symbolMaxNotional =
        accountInfo.max_notional?.[symbol] ??
        positionsPerp.maxPositionNotional({
          leverage,
          IMRFactor: IMR_Factor,
        });

      const currentOrderReferencePrice =
        typeof reduceOnlyOrOptions === "object" &&
        reduceOnlyOrOptions !== null &&
        typeof reduceOnlyOrOptions.currentOrderReferencePrice === "number" &&
        reduceOnlyOrOptions.currentOrderReferencePrice > 0
          ? reduceOnlyOrOptions.currentOrderReferencePrice
          : markPrice;

      return account.maxQtyForIsolatedMargin({
        symbol,
        orderSide: side,
        currentOrderReferencePrice,
        availableBalance,
        leverage,
        baseIMR,
        IMR_Factor,
        markPrice,
        positionQty,
        pendingLongOrders,
        pendingSellOrders,
        isoOrderFrozenLong,
        isoOrderFrozenShort,
        symbolMaxNotional,
      });
    }

    // Only calculate otherIMs for CROSS margin mode (not needed for ISOLATED)
    const otherIMs = account.otherIMs({
      positions: otherPositions,
      symbolInfo,
      markPrices,
      IMR_Factors: accountInfo.imr_factor,
    });

    return account.maxQty(side, {
      markPrice,
      symbol,
      baseMaxQty: getSymbolInfo("base_max"),
      totalCollateral,
      maxLeverage: leverage,
      takerFeeRate: accountInfo.futures_taker_fee_rate,
      baseIMR,
      otherIMs,
      positionQty,
      buyOrdersQty,
      sellOrdersQty,
      IMR_Factor,
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
    finalMarginMode,
    symbolLeverage,
  ]);

  return Math.max(maxQty, 0);
}
