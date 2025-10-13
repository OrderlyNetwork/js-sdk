import { type API } from "@kodiak-finance/orderly-types";
import { getTimestamp } from "@kodiak-finance/orderly-utils";
import { createGetter } from "../utils/createGetter";
import { useAppStore } from "./appStore";

export type FundingRates = ReturnType<typeof useFundingRates>;

export const useFundingRates = () => {
  const data = useAppStore((state) => state.fundingRates);

  return createGetter<API.FundingRate>({ ...data });
};

export const useFundingRatesStore = () => {
  const data = useAppStore((state) => state.fundingRates);
  return data;
};

function getEstFundingRate(data: API.FundingRate) {
  if (!data) return;

  const { next_funding_time, est_funding_rate } = data;

  if (getTimestamp() > next_funding_time) {
    return null;
  }

  return est_funding_rate;
}
