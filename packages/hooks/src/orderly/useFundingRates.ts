import { useQuery } from "../useQuery";
import { type API } from "@orderly/types";
import { createGetter } from "../utils/createGetter";

export const useFundingRates = () => {
  const { data, isLoading } = useQuery<API.FundingRate[]>(`/public/info`);

  return createGetter(data);
};
