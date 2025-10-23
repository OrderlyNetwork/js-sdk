import { useMemo } from "react";
import {
  useFundingDetails,
  useFundingRateBySymbol,
  usePositionStream,
} from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

interface FundingRateOptions {
  symbol: string;
}

export const useFundingRateModalScript = (options: FundingRateOptions) => {
  const { data, isLoading } = useFundingDetails(options.symbol);
  const { last_funding_rate, est_funding_rate } =
    useFundingRateBySymbol(options.symbol) ?? {};

  const [{ aggregated, rows }] = usePositionStream(options.symbol);

  const { notional } = aggregated ?? {};

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
    if (!last_funding_rate || !data?.funding_period) {
      return undefined;
    }
    const rate = new Decimal(last_funding_rate).mul(100).toNumber();
    const annualized = calculateAnnualizedRate(rate, data.funding_period);
    return annualized ? `${annualized}%` : undefined;
  }, [last_funding_rate, data?.funding_period]);

  const estFundingRateAnnualized = useMemo(() => {
    if (!est_funding_rate || !data?.funding_period) {
      return undefined;
    }
    const rate = new Decimal(est_funding_rate).mul(100).toNumber();
    const annualized = calculateAnnualizedRate(rate, data.funding_period);
    return annualized ? `${annualized}%` : undefined;
  }, [est_funding_rate, data?.funding_period]);

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
};

export type FundingRateModalState = ReturnType<
  typeof useFundingRateModalScript
>;
