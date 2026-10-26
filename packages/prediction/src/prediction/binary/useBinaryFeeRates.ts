import { useMemo } from "react";
import { useAccountInfo } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { validBinaryFee } from "./binaryOrderRules";

export type BinaryFeeRates = {
  /** Coefficient r in fee = C*r*p*(1-p); undefined when no valid config. */
  takerRate: number | undefined;
  makerRate: number | undefined;
  /** Raw bps values for display. */
  takerBps: number | undefined;
  makerBps: number | undefined;
};

/**
 * Binary probability-fee coefficients from Client Info (api-spec §6.4). The
 * API returns bps; divide by 10000 exactly once. Missing/invalid config is
 * NOT free — consumers must keep the estimate hidden instead of zero.
 */
export const binaryFeeRates = (data?: API.AccountInfo): BinaryFeeRates => {
  const takerBps = validBinaryFee(data?.binary_taker_fee_rate)
    ? data.binary_taker_fee_rate
    : undefined;
  const makerBps = validBinaryFee(data?.binary_maker_fee_rate)
    ? data.binary_maker_fee_rate
    : undefined;
  return {
    takerBps,
    makerBps,
    takerRate:
      takerBps != null
        ? new Decimal(takerBps).div(10_000).toNumber()
        : undefined,
    makerRate:
      makerBps != null
        ? new Decimal(makerBps).div(10_000).toNumber()
        : undefined,
  };
};
export const useBinaryFeeRates = (
  override?: BinaryFeeRates,
): BinaryFeeRates => {
  const { data } = useAccountInfo();
  return useMemo(() => override ?? binaryFeeRates(data), [data, override]);
};
