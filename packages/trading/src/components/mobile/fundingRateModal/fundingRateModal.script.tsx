import { useMemo } from "react";
import { useFundingDetails } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

interface FundingRateOptions {
  symbol: string;
}

export const useFundingRateModalScript = (options: FundingRateOptions) => {
  const { data, isLoading } = useFundingDetails(options.symbol);

  const fundingPeriod = useMemo(() => {
    if (!data || isLoading) {
      return "-";
    }
    return `${data.funding_period}h`;
  }, [data, isLoading]);

  const capFunding = useMemo(() => {
    if (!data || isLoading) {
      return "-";
    }
    return `${new Decimal(data.cap_funding).mul(100).toNumber()}%`;
  }, [data, isLoading]);

  const floorFunding = useMemo(() => {
    if (!data || isLoading) {
      return "-";
    }
    return `${new Decimal(data.floor_funding).mul(100).toNumber()}%`;
  }, [data, isLoading]);

  return { fundingPeriod, capFunding, floorFunding };
};

export type FundingRateModalState = ReturnType<
  typeof useFundingRateModalScript
>;
