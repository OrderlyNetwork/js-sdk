import { useQuery } from "../useQuery";
import { type API } from "@orderly.network/types";
import { createGetter } from "../utils/createGetter";
import { getTimestamp } from "@orderly.network/utils";

export const useFundingRates = () => {
  const { data } = useQuery<{ [key: string]: API.FundingRate }>(
    `/v1/public/funding_rates`,
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
          obj[item.symbol] = {
            ...item,
            est_funding_rate: getEstFundingRate(item),
          };
        }

        return obj;
      },
    }
  );

  return createGetter<API.FundingRate>(data);
};

function getEstFundingRate(data: API.FundingRate) {
  if (!data) return;

  const { next_funding_time, est_funding_rate } = data;

  if (getTimestamp() > next_funding_time) {
    return null;
  }

  return est_funding_rate;
}
