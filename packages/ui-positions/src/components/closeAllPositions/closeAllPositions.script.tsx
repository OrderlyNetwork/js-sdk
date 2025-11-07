import { useCallback, useMemo } from "react";
import {
  usePositionStream,
  useSubAccountMutation,
  useTrack,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  API,
  OrderSide,
  OrderType,
  TrackerEventName,
} from "@orderly.network/types";
import { modal, Text, toast } from "@orderly.network/ui";

export interface UseCloseAllPositionsScriptOptions {
  symbol?: string;
  onSuccess?: () => void;
}

export const useCloseAllPositionsScript = (
  options?: UseCloseAllPositionsScriptOptions,
) => {
  const { symbol, onSuccess } = options || {};
  const { t } = useTranslation();
  const { tracking } = useTrack();

  // Get all positions data
  const [positionsData] = usePositionStream(symbol);

  // Get open positions (positions with non-zero quantity)
  const openPositions = useMemo(() => {
    if (!positionsData?.rows) return [];
    return positionsData.rows.filter(
      (position: API.PositionTPSLExt) =>
        position.position_qty !== 0 && position.position_qty !== undefined,
    );
  }, [positionsData]);

  // Check if there are open positions
  const hasOpenPositions = useMemo(() => {
    return openPositions.length > 0;
  }, [openPositions]);

  const [doCreateOrder, { isMutating }] = useSubAccountMutation(
    "/v1/order",
    "POST",
  );

  // Close all positions function
  const closeAllPositions = useCallback(async () => {
    if (!hasOpenPositions) return;

    try {
      // Create market orders to close each position
      const closePromises = openPositions.map(
        (position: API.PositionTPSLExt) => {
          const side =
            position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY;
          const quantity = Math.abs(position.position_qty);

          return doCreateOrder({
            symbol: position.symbol,
            order_type: OrderType.MARKET,
            side,
            order_quantity: quantity,
            reduce_only: true,
          });
        },
      );

      await Promise.all(closePromises);

      toast.success(t("positions.closeAll.success"));
      onSuccess?.();

      return true;
    } catch (error: any) {
      if (error?.message !== undefined) {
        toast.error(error.message);
      }
      return false;
    }
  }, [openPositions, hasOpenPositions, doCreateOrder, t, onSuccess]);

  // Show confirmation modal
  const onCloseAll = useCallback(() => {
    modal.confirm({
      title: t("positions.closeAll"),
      content: <Text size="sm">{t("positions.closeAll.description")}</Text>,
      onCancel: async () => {},
      onOk: async () => {
        try {
          // Track event
          tracking(TrackerEventName.confirmCloseAllPositions, {
            positions_count: openPositions.length,
          });

          const result = await closeAllPositions();
          return Promise.resolve(result);
        } catch (error) {
          return Promise.resolve(false);
        }
      },
    });
  }, [t, tracking, openPositions, closeAllPositions]);

  return {
    onCloseAll,
    hasOpenPositions,
    isClosing: isMutating,
    openPositionsCount: openPositions.length,
    symbol,
  };
};

export type CloseAllPositionsState = ReturnType<
  typeof useCloseAllPositionsScript
>;
