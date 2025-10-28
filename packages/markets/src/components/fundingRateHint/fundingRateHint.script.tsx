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

  const [{ aggregated, rows }] = usePositionStream(symbol);

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
    if (!est_funding_rate || !notional || rows.length === 0) {
      return "--";
    }

    return `${new Decimal(est_funding_rate).mul(notional).todp(4).toNumber()}`;
  }, [est_funding_rate, notional, rows]);

  // Calculate annualized funding rate
  const calculateAnnualizedRate = (rate: number, intervalHours: number) => {
    if (!rate || !intervalHours) return undefined;
    // annualized rate = funding rate * 24h / interval(h) * 365
    const annualizedRate = new Decimal(rate)
      .mul(24)
      .div(intervalHours)
      .mul(365);
    // Round down to two decimal places
    return annualizedRate.todp(2, Decimal.ROUND_DOWN).toNumber();
  };

  const lastFundingRateAnnualized = useMemo(() => {
    if (!last_funding_rate || !fundingDetails?.funding_period) {
      return undefined;
    }
    const rate = new Decimal(last_funding_rate).mul(100).toNumber();
    const annualized = calculateAnnualizedRate(
      rate,
      fundingDetails.funding_period,
    );
    return annualized ? `${annualized}%` : undefined;
  }, [last_funding_rate, fundingDetails?.funding_period]);

  const estFundingRateAnnualized = useMemo(() => {
    if (!est_funding_rate || !fundingDetails?.funding_period) {
      return undefined;
    }
    const rate = new Decimal(est_funding_rate).mul(100).toNumber();
    const annualized = calculateAnnualizedRate(
      rate,
      fundingDetails.funding_period,
    );
    return annualized ? `${annualized}%` : undefined;
  }, [est_funding_rate, fundingDetails?.funding_period]);

  return useMemo(() => {
    return {
      fundingPeriod,
      capFunding,
      floorFunding,
      lastFundingRate,
      estFundingRate,
      estFundingFee,
      lastFundingRateAnnualized,
      estFundingRateAnnualized,
    };
  }, [
    fundingPeriod,
    capFunding,
    floorFunding,
    lastFundingRate,
    estFundingRate,
    estFundingFee,
    lastFundingRateAnnualized,
    estFundingRateAnnualized,
    symbol,
  ]);
};

export type FundingRateHintState = ReturnType<typeof useFundingRateHintScript>;
