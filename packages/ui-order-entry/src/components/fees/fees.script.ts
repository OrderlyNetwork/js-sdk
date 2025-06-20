import { useMemo } from "react";
import { useAccountInfo } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

export const useFeesScript = () => {
  const { data } = useAccountInfo();

  const takerFeeRate = useMemo(() => {
    const value = data?.futures_taker_fee_rate;
    if (typeof value === "undefined") {
      return undefined;
    }
    return `${new Decimal(value).mul(0.01).toString()}%`;
  }, [data]);

  const makerFeeRate = useMemo(() => {
    const value = data?.futures_maker_fee_rate;
    if (typeof value === "undefined") {
      return undefined;
    }
    return `${new Decimal(value).mul(0.01).toString()}%`;
  }, [data]);

  return { takerFeeRate, makerFeeRate } as const;
};
