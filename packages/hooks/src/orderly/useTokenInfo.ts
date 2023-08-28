import { useQuery } from "../useQuery";
import { type API } from "@orderly.network/types";
import { createGetter } from "../utils/createGetter";

export const useTokenInfo = () => {
  const { data = {} } = useQuery<Record<string, API.TokenInfo>>(
    "/public/token",
    {
      focusThrottleInterval: 1000 * 60 * 60 * 24,
      revalidateOnFocus: false,
      formatter(data: { rows: API.TokenInfo[] }) {
        if (!data?.rows || !data?.rows?.length) {
          return {};
        }
        const obj = Object.create(null);

        for (let index = 0; index < data.rows.length; index++) {
          const item = data.rows[index];

          obj[item.token] = item;
        }

        return obj;
      },
    }
  );

  return createGetter<API.TokenInfo>(data as any);
};
