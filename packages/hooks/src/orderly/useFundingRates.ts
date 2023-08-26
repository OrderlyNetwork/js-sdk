import { useQuery } from "../useQuery";
import { type API } from "@orderly/types";
import { createGetter } from "../utils/createGetter";

export const useFundingRates = () => {
  const { data } = useQuery<{ [key: string]: API.FundingRate }>(
    `/public/funding_rates`,
    {
      focusThrottleInterval: 1000 * 60 * 60 * 24,
      revalidateOnFocus: false,
      formatter(data: { rows: API.FundingRate[] }) {
        if (!data?.rows || !data?.rows?.length) {
          return {};
        }
        const obj = Object.create(null);

        for (let index = 0; index < data.rows.length; index++) {
          const item = data.rows[index];
          obj[item.symbol] = item;
        }

        return obj;
      },
    }
  );

  return createGetter<API.FundingRate>(data);
};
