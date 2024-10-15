import { useQuery } from "../useQuery";
import { type API } from "@orderly.network/types";
import { createGetter } from "../utils/createGetter";
import { getTimestamp } from "@orderly.network/utils";
import { useAppStore } from "./appStore";

export const useFundingRates = () => {
  const data = useAppStore((state) => state.fundingRates);

  return createGetter<API.FundingRate>({ ...data });
};

function getEstFundingRate(data: API.FundingRate) {
  if (!data) return;

  const { next_funding_time, est_funding_rate } = data;

  if (getTimestamp() > next_funding_time) {
    return null;
  }

  return est_funding_rate;
}
