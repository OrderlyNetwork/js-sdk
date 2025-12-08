import { useCallback, useMemo } from "react";
import {
  useLocalStorage,
  useMarkPrice,
  useMaxQty,
  useSubAccountMutation,
  useSymbolsInfo,
} from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { API, OrderSide, OrderType } from "@veltodefi/types";
import { toast } from "@veltodefi/ui";
import { useScreen } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";
import { usePositionsRowContext } from "../positions/positionsRowContext";

export interface UseReversePositionScriptOptions {
  position: API.PositionExt | API.PositionTPSLExt;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for managing reverse position enabled state
 * Separates desktop and mobile preferences internally
 */
export const useReversePositionEnabled = () => {
  const { isMobile, isDesktop } = useScreen();

  // Preference storage for desktop and mobile separately
  const [desktopEnabled, setDesktopEnabled] = useLocalStorage(
    "orderly_reverse_position_enabled_desktop",
    true,
  );
  const [mobileEnabled, setMobileEnabled] = useLocalStorage(
    "orderly_reverse_position_enabled_mobile",
    false,
  );

  // Get current preference based on platform
  const isEnabled = useMemo(() => {
    if (isMobile) {
      return mobileEnabled;
    }
    if (isDesktop) {
      return desktopEnabled;
    }
    return false;
  }, [isMobile, isDesktop, desktopEnabled, mobileEnabled]);

  // Set enabled state based on current platform
  const setEnabled = useCallback(
    (enabled: boolean) => {
      if (isMobile) {
        setMobileEnabled(enabled);
      } else if (isDesktop) {
        setDesktopEnabled(enabled);
      }
    },
    [isMobile, isDesktop, setMobileEnabled, setDesktopEnabled],
  );

  return {
    isEnabled,
    setEnabled,
  };
};

export const useReversePositionScript = (
  options?: UseReversePositionScriptOptions,
) => {
  const { position, onSuccess, onError } = options || {};
  const { t } = useTranslation();
  const { isEnabled, setEnabled } = useReversePositionEnabled();

  const symbolsInfo = useSymbolsInfo();
  const symbol = position?.symbol || "";
  const { data: symbolMarketPrice } = useMarkPrice(symbol);
  const symbolInfo = symbolsInfo?.[symbol];

  // Calculate reverse order quantity
  const positionQty = useMemo(() => {
    if (!position) return 0;
    return Math.abs(position.position_qty);
  }, [position]);

  // Determine current position side
  const isLong = useMemo(() => {
    if (!position) return false;
    return position.position_qty > 0;
  }, [position]);

  // Calculate max quantity for opening opposite position
  const oppositeSide = useMemo(() => {
    return isLong ? OrderSide.SELL : OrderSide.BUY;
  }, [isLong]);

  const maxOpenQty = useMaxQty(symbol, oppositeSide, false);

  // Calculate actual reverse quantity (use max available if insufficient margin)
  const reverseQty = useMemo(() => {
    if (!position) return 0;
    const desiredQty = positionQty;
    // If margin is insufficient, use maximum available
    if (desiredQty > maxOpenQty && maxOpenQty > 0) {
      return maxOpenQty;
    }
    return desiredQty;
  }, [positionQty, maxOpenQty]);

  const [doCreateOrder, { isMutating }] = useSubAccountMutation(
    "/v1/order",
    "POST",
    {
      accountId: position?.account_id,
    },
  );

  // Reverse position logic
  const reversePosition = useCallback(async () => {
    if (!position || positionQty === 0) {
      toast.error("No position to reverse");
      return false;
    }

    try {
      // Step 1: Close current position (market order with reduce_only)
      const closeSide = isLong ? OrderSide.SELL : OrderSide.BUY;
      const closeOrder = await doCreateOrder({
        symbol: position.symbol,
        order_type: OrderType.MARKET,
        side: closeSide,
        order_quantity: new Decimal(positionQty).toString(),
        reduce_only: true,
      });

      // if (!closeOrder.success) {
      //   throw new Error(closeOrder.message || "Failed to close position");
      // }

      // Step 2: Open opposite position (market order without reduce_only)
      const openSide = isLong ? OrderSide.SELL : OrderSide.BUY;
      const openOrder = await doCreateOrder({
        symbol: position.symbol,
        order_type: OrderType.MARKET,
        side: openSide,
        order_quantity: new Decimal(reverseQty).toString(),
        reduce_only: false,
      });

      if (!openOrder.success) {
        throw new Error(
          openOrder.message || "Failed to open opposite position",
        );
      }

      onSuccess?.();

      return true;
    } catch (error: any) {
      // if (error?.message !== undefined) {
      //   toast.error(error.message);
      // } else {
      //   toast.error("Failed to reverse position");
      // }
      onError?.(error);
      return false;
    }
  }, [position, positionQty, reverseQty, isLong, doCreateOrder, t, onSuccess]);

  // Get display information
  const displayInfo = useMemo(() => {
    if (!position || !symbolInfo) {
      return null;
    }

    const base = symbolInfo("base");
    const quote = symbolInfo("quote");
    const baseDp = symbolInfo("base_dp");
    const quoteDp = symbolInfo("quote_dp");
    const leverage = position.leverage || 1;

    return {
      symbol: position.symbol,
      base,
      quote,
      baseDp,
      quoteDp,
      positionQty: new Decimal(positionQty).todp(baseDp).toString(),
      reverseQty: new Decimal(reverseQty).todp(baseDp).toString(),
      markPrice: symbolMarketPrice
        ? new Decimal(symbolMarketPrice).todp(quoteDp).toString()
        : "--",
      leverage,
      isLong,
    };
  }, [
    position,
    symbolMarketPrice,
    symbolInfo,
    positionQty,
    reverseQty,
    isLong,
  ]);

  return {
    isEnabled,
    setEnabled,
    reversePosition,
    isReversing: isMutating,
    displayInfo,
    positionQty,
    reverseQty,
    isLong,
  };
};

export type ReversePositionState = ReturnType<typeof useReversePositionScript>;
