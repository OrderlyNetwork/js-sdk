import { useQuery } from "../useQuery";
import { type API } from "@orderly.network/types";
import { createGetter } from "../utils/createGetter";
import { useAppStore } from "./appStore";

export const useFundingRates = () => {
  const data = useAppStore((state) => state.fundingRates);

  return createGetter<API.FundingRate>({ ...data });
};
