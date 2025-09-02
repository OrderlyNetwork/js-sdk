import { useMemo } from "react";
import { useAccountInfo } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

export const useFeesScript = () => {
  const { data, isLoading } = useAccountInfo();

  const takerFeeRate = useMemo(() => {
    if (isLoading) {
      return "-";
    }
    const value = data?.futures_taker_fee_rate;
    if (typeof value === "undefined" || value === null) {
      return "-";
    }
    return `${new Decimal(value).mul(0.01).toNumber()}%`;
  }, [data, isLoading]);

  const makerFeeRate = useMemo(() => {
    if (isLoading) {
      return "-";
    }
    const value = data?.futures_maker_fee_rate;
    if (typeof value === "undefined" || value === null) {
      return "-";
    }
    return `${new Decimal(value).mul(0.01).toNumber()}%`;
  }, [data, isLoading]);

  return { takerFeeRate: takerFeeRate, makerFeeRate: makerFeeRate } as const;
};
