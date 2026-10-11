import { useCallback } from "react";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import {
  estimateBinaryOrderFrozen,
  maxBinaryOrderQuantity,
  type BinaryFundingEstimateMode,
} from "../../binary/binaryCollateral";
import { isBinaryRowTradable } from "../../binary/binaryInfo";
import type { BinaryInfoRow } from "../../binary/binaryInfo";
import {
  splitBinaryQuantity,
  toBinaryUpRequest,
} from "../../binary/binaryOrderRules";
import type { BinaryFeeRates } from "../../binary/useBinaryFeeRates";
import type { PredictionOutcome } from "../../prediction.types";
import type { PredictionAccountResources } from "../usePredictionAccountResources";

/**
 * UP-book request coordinates from the user's outcome view (api-spec §5.2):
 * buying DOWN @n is SELL UP @(1-n); selling a DOWN position (closing a short)
 * is BUY UP @(1-n).
 */
const toUpBookRequest = toBinaryUpRequest;

export type AccountEstimatesArgs = {
  resources: PredictionAccountResources;
  active: boolean;
  configBySymbol: Map<string, BinaryInfoRow>;
  selectedSymbol: string | undefined;
  feeRates: BinaryFeeRates;
  hasFeeConfig: boolean;
};

export const useAccountEstimates = ({
  resources,
  active,
  configBySymbol,
  selectedSymbol,
  feeRates,
  hasFeeConfig,
}: AccountEstimatesArgs) => {
  const { balance, getCollateralSnapshot } = resources;
  const availableQuantity = useCallback(
    (outcome: PredictionOutcome, excludeId?: number, symbol = selectedSymbol) =>
      resources.availableQuantity(outcome, excludeId, symbol),
    [resources.availableQuantity, selectedSymbol],
  );
  const fundingEstimateMode: BinaryFundingEstimateMode =
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
  return {
    availableQuantity,
    fundingEstimateMode,
    estimateAdditionalFrozen,
    maxOpeningQuantity,
    isOrderTradable,
    estimateFee,
  };
};

export type AccountEstimates = ReturnType<typeof useAccountEstimates>;
