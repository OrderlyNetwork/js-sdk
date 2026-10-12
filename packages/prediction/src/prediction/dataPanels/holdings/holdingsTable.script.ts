import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import { predictionPositionKey } from "../../binary/binaryManagedPositions";
import type {
  PredictionAccountPanelState,
  PredictionPosition,
} from "../../prediction.types";
import { usePredictionFilters } from "../../predictionFilters.script";

export const useHoldingsTableScript = () => {
  const filters = usePredictionFilters();
  return { filters };
};

export type HoldingsTableScript = ReturnType<typeof useHoldingsTableScript>;

export type HoldingsPositionRow = {
  id: string;
  position: PredictionPosition;
  /** Only the selected round has a subscribed book; other rounds' rows stay readable but without live valuation. */
  isSelectedRound: boolean;
  lastPrice: number | undefined;
  uPnL: number | undefined;
  /** Resolved once per row against the current collateral snapshot. */
  availableQuantity: number;
};

/**
 * Shared per-position view model for the desktop table and the mobile
 * cards: keeps the Decimal valuation and the collateral-snapshot walk out
 * of the per-row render path (both used to recompute these every second).
 */
export const useHoldingsPositionRows = (
  state: PredictionAccountPanelState,
  matches: (position: {
    outcome: string;
    side?: string;
    status?: string;
    timestamp?: number;
  }) => boolean,
  getPositionState?: (
    position: PredictionPosition,
  ) => PredictionAccountPanelState,
): HoldingsPositionRow[] =>
  useMemo(
    () =>
      state.positions.filter(matches).map((position) => {
        const isSelectedRound =
          position.symbol === state.marketView?.selectedRow?.symbol;
        const lastPrice = isSelectedRound
          ? state.marketView?.outcomePrices[position.outcome]
          : position.markPrice;
        return {
          id: predictionPositionKey(position),
          position,
          isSelectedRound,
          lastPrice,
          uPnL:
            lastPrice != null
              ? new Decimal(lastPrice)
                  .sub(position.averagePrice)
                  .mul(position.quantity)
                  .toNumber()
              : undefined,
          availableQuantity: (
            getPositionState?.(position) ?? state
          ).availableQuantity(position.outcome, undefined, position.symbol),
        };
      }),
    [
      state.positions,
      matches,
      state.marketView?.selectedRow?.symbol,
      state.marketView?.outcomePrices,
      state.availableQuantity,
      getPositionState,
    ],
  );
