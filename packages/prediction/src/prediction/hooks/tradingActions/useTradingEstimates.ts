import { useCallback } from "react";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import {
  estimateBinaryOrderFrozen,
  ISO_ORDER_FROZEN_BUFFER,
  maxBinaryOrderQuantity,
} from "../../binary/binaryCollateral";
import { isBinaryRowTradable } from "../../binary/binaryInfo";
import type { BinaryInfoRow } from "../../binary/binaryInfo";
import {
  binaryProtectionPrice,
  splitBinaryQuantity,
  toBinaryUpRequest,
} from "../../binary/binaryOrderRules";
import type { useBinaryFeeRates } from "../../binary/useBinaryFeeRates";
import type {
  PredictionOrderSide,
  PredictionOutcome,
} from "../../prediction.types";
import type { PredictionAccountResources } from "../usePredictionAccountResources";

/**
 * UP-book request coordinates from the user's outcome view (api-spec §5.2):
 * buying DOWN @n is SELL UP @(1-n); selling a DOWN position (closing a short)
 * is BUY UP @(1-n).
 */
const toUpBookRequest = toBinaryUpRequest;

export type TradingEstimatesArgs = {
  resources: PredictionAccountResources;
  active: boolean;
  configBySymbol: Map<string, BinaryInfoRow>;
  selectedSymbol: string | undefined;
  /** UP-coordinates BBO of the selected round's book. */
  bbo: {
    bestAsk: number | undefined;
    bestBid: number | undefined;
  };
  /** Maximum absolute price movement in quote ticks. */
  slippage: string;
  feeRates: ReturnType<typeof useBinaryFeeRates>;
  hasFeeConfig: boolean;
};

export const useTradingEstimates = ({
  resources,
  active,
  configBySymbol,
  selectedSymbol,
  bbo,
  slippage,
  feeRates,
  hasFeeConfig,
}: TradingEstimatesArgs) => {
  const { balance, getCollateralSnapshot } = resources;
  const availableQuantity = useCallback(
    (outcome: PredictionOutcome, excludeId?: number, symbol = selectedSymbol) =>
      resources.availableQuantity(outcome, excludeId, symbol),
    [resources.availableQuantity, selectedSymbol],
  );
  const fundingEstimateMode =
    getCollateralSnapshot(selectedSymbol)?.mode ?? "unavailable";
  const estimateAdditionalFrozen = useCallback(
    (
      outcome: PredictionOutcome,
      quantity: number,
      displayPrice: number,
      symbol = selectedSymbol,
    ) => {
      const { upSide, upPrice } = toUpBookRequest(outcome, "buy", displayPrice);
      const config = symbol ? configBySymbol.get(symbol) : undefined;
      const quantities = config
        ? splitBinaryQuantity(quantity, upPrice, config)
        : undefined;
      if (!quantities) return undefined;
      return estimateBinaryOrderFrozen(
        getCollateralSnapshot(symbol),
        upSide,
        upPrice,
        quantity,
        quantities,
      )?.toNumber();
    },
    [configBySymbol, getCollateralSnapshot, selectedSymbol],
  );
  const maxOpeningQuantity = useCallback(
    (
      outcome: PredictionOutcome,
      displayPrice: number,
      symbol = selectedSymbol,
    ) => {
      const config = symbol ? configBySymbol.get(symbol) : undefined;
      if (!config) return 0;
      const { upSide, upPrice } = toUpBookRequest(outcome, "buy", displayPrice);
      return maxBinaryOrderQuantity({
        snapshot: getCollateralSnapshot(symbol),
        side: upSide,
        upPrice,
        balance,
        baseTick: config.base_tick,
        baseMax: config.base_max,
        splitRules: config,
      });
    },
    [balance, configBySymbol, getCollateralSnapshot, selectedSymbol],
  );
  /** Preview and submission share the live UP-book tick protection price. */
  const protectionPrice = useCallback(
    (
      outcome: PredictionOutcome,
      side: PredictionOrderSide,
      symbol = selectedSymbol,
    ) =>
      symbol === selectedSymbol
        ? binaryProtectionPrice(
            outcome,
            side,
            bbo,
            slippage,
            symbol ? configBySymbol.get(symbol) : undefined,
          )
        : undefined,
    [bbo, configBySymbol, selectedSymbol, slippage],
  );
  const isOrderTradable = useCallback(
    (symbol?: string) => {
      const config = symbol ? configBySymbol.get(symbol) : undefined;
      return (
        active && config != null && isBinaryRowTradable(config, getTimestamp())
      );
    },
    [active, configBySymbol],
  );
  /**
   * Curve fee estimate C*r*p*(1-p) with the UP price p; undefined while the
   * account has no valid binary config (never free).
   */
  const estimateFee = useCallback(
    (quantity: number, upPrice: number, taker: boolean) => {
      const rate = taker ? feeRates.takerRate : feeRates.makerRate;
      if (
        !hasFeeConfig ||
        rate == null ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(upPrice) ||
        upPrice <= 0 ||
        upPrice >= 1
      )
        return undefined;
      return new Decimal(quantity)
        .mul(rate)
        .mul(upPrice)
        .mul(new Decimal(1).sub(upPrice))
        .toNumber();
    },
    [hasFeeConfig, feeRates.makerRate, feeRates.takerRate],
  );
  /**
   * Collateral frozen when opening a position: the price of the outcome being
   * bought × qty × (1 + ISO buffer). Buying DOWN @n is SELL UP @(1-n), which
   * freezes (1-n)×qty×(1+b) — i.e. the DISPLAY price in both cases (PRD §7.2
   * fixture: 100@0.1 BUY freezes 10.006, SELL 90.054).
   */
  const estimateFrozen = useCallback(
    (quantity: number, displayPrice: number) =>
      new Decimal(quantity)
        .mul(displayPrice)
        .mul(new Decimal(1).add(ISO_ORDER_FROZEN_BUFFER))
        .toNumber(),
    [],
  );
  return {
    availableQuantity,
    fundingEstimateMode,
    estimateAdditionalFrozen,
    maxOpeningQuantity,
    protectionPrice,
    isOrderTradable,
    estimateFee,
    estimateFrozen,
  };
};

export type TradingEstimates = ReturnType<typeof useTradingEstimates>;
