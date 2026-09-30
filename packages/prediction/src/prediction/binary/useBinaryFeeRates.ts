import { useMemo } from "react";
import { useAccountInfo } from "@orderly.network/hooks";

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
export const useBinaryFeeRates = (): BinaryFeeRates => {
  const { data } = useAccountInfo();

  return useMemo(() => {
    const takerBps = data?.binary_taker_fee_rate;
    const makerBps = data?.binary_maker_fee_rate;
    return {
      takerBps,
      makerBps,
      takerRate:
        typeof takerBps === "number" && takerBps >= 0
          ? takerBps / 10_000
          : undefined,
      makerRate:
        typeof makerBps === "number" && makerBps >= 0
          ? makerBps / 10_000
          : undefined,
    };
  }, [data]);
};
