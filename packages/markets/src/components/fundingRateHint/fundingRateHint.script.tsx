import { useMemo } from "react";
import {
  useFundingDetails,
  useFundingRateBySymbol,
  usePositionStream,
} from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

export const useFundingRateHintScript = (symbol: string) => {
  const { data: fundingDetails, isLoading: isFundingLoading } =
    useFundingDetails(symbol);

  const { last_funding_rate, est_funding_rate } =
    useFundingRateBySymbol(symbol) ?? {};

  const [{ aggregated }] = usePositionStream(symbol);

  const { notional } = aggregated ?? {};

  const fundingPeriod = useMemo(() => {
    if (!fundingDetails || isFundingLoading) {
      return "-";
    }
    return `${fundingDetails.funding_period}h`;
  }, [fundingDetails, isFundingLoading]);

  const capFunding = useMemo(() => {
    if (!fundingDetails || isFundingLoading) {
      return "-";
    }
    return `${new Decimal(fundingDetails.cap_funding).mul(100).toNumber()}%`;
  }, [fundingDetails, isFundingLoading]);

  const floorFunding = useMemo(() => {
    if (!fundingDetails || isFundingLoading) {
      return "-";
    }
    return `${new Decimal(fundingDetails.floor_funding).mul(100).toNumber()}%`;
  }, [fundingDetails, isFundingLoading]);

  const lastFundingRate = useMemo(() => {
    if (!last_funding_rate) {
      return undefined;
    }
    return `${new Decimal(last_funding_rate).mul(100).toNumber()}%`;
  }, [last_funding_rate]);

  const estFundingRate = useMemo(() => {
    if (!est_funding_rate) {
      return undefined;
    }
    return `${new Decimal(est_funding_rate).mul(100).toNumber()}%`;
  }, [est_funding_rate]);

  const estFundingFee = useMemo(() => {
    if (!est_funding_rate || !notional) {
      return "--";
    }

    return `${new Decimal(est_funding_rate).mul(notional).todp(2).toNumber()}`;
  }, [est_funding_rate, notional]);

  return useMemo(() => {
    return {
      fundingPeriod,
      capFunding,
      floorFunding,
      lastFundingRate,
      estFundingRate,
      estFundingFee,
    };
  }, [
    fundingPeriod,
    capFunding,
    floorFunding,
    lastFundingRate,
    estFundingRate,
    estFundingFee,
  ]);
};

export type FundingRateHintState = ReturnType<typeof useFundingRateHintScript>;
