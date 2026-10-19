import { useMemo } from "react";
import type { API } from "@orderly.network/types";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import { binaryHistoryWindow } from "../../binary/binaryHistory";
import { predictionPositionKey } from "../../binary/binaryManagedPositions";
import { complementPrice } from "../../binary/binaryOrderRules";
import {
  mergeBinaryDetail,
  publishedBinaryOutcome,
} from "../../binary/binarySettlement";
import type {
  PredictionAccountPanelState,
  PredictionPosition,
  PredictionResult,
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
  /** Used only to resolve fallback metadata from the page selection. */
  isSelectedRound: boolean;
  lastPrice: number | undefined;
  uPnL: number | undefined;
  /** Resolved once per row against the current collateral snapshot. */
  availableQuantity: number;
  /** The position's own metadata drives countdowns and terminal states. */
  roundInfo: API.BinaryInfoRow | undefined;
  resolvedOutcome: PredictionResult | undefined;
};

/**
 * Shared per-position view model for the desktop table and the mobile
 * cards: keeps the Decimal valuation and the collateral-snapshot walk out
 * of the per-row render path (both used to recompute these every second).
 */
export const buildHoldingsPositionRows = (
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
  state.positions.filter(matches).map((position) => {
    const isSelectedRound =
      position.symbol === state.marketView?.selectedRow?.symbol;
    const roundInfo =
      mergeBinaryDetail(
        state.roundBySymbol?.(position.symbol),
        isSelectedRound ? state.marketView?.selectedRow : undefined,
      ) ?? (isSelectedRound ? state.marketView?.selectedRow : undefined);
    const now = state.roundNow ?? getTimestamp();
    const expireAt =
      roundInfo?.expire_at ??
      (position.symbol ? binaryHistoryWindow(position.symbol)?.to : undefined);
    const published = publishedBinaryOutcome(roundInfo);
    // Public settlement prices are UP coordinates; position marks are already
    // converted to their outcome by toPredictionPosition.
    const settlementPrice =
      published != null
        ? position.outcome === "up"
          ? roundInfo!.settlement_price_per_share!
          : complementPrice(roundInfo!.settlement_price_per_share!)
        : undefined;
    const lastPrice =
      settlementPrice ??
      (expireAt != null && now >= expireAt
        ? undefined
        : position.markPrice != null &&
            Number.isFinite(position.markPrice) &&
            position.markPrice >= 0 &&
            position.markPrice <= 1
          ? position.markPrice
          : undefined);
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
      roundInfo,
      resolvedOutcome: published,
    };
  });

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
    () => buildHoldingsPositionRows(state, matches, getPositionState),
    [
      state.positions,
      matches,
      state.marketView?.selectedRow,
      state.roundNow,
      state.availableQuantity,
      state.roundBySymbol,
      getPositionState,
    ],
  );
