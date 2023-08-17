import { useQuery } from "../useQuery";
import { type API } from "@orderly/core";

export const useSymbolsInfo = () => {
  const { data, isLoading } = useQuery<API.SymbolExt[]>(`/public/info`, {
    formatter(data: { rows: API.Symbol[] }) {
      if (!data?.rows || !data?.rows?.length) {
        return {};
      }
      const obj = Object.create(null);

      for (let index = 0; index < data.rows.length; index++) {
        const item = data.rows[index];
        const arr = item.symbol.split("_");
        obj[item.symbol] = {
          ...item,
          base: arr[2],
          quote: arr[1],
          type: arr[0],
        };
      }

      return obj;
    },
  });

  return new Proxy(
    {},
    {
      get(target: any, property, receiver) {
        if (property === "isLoading") return isLoading;
        return (value: string, defaultValue: any) => {
          if (value) {
            // console.log(data, property, value);
            if (!data) return defaultValue;
            return (data as any)[property]?.[value] ?? defaultValue;
          } else {
            return target[property];
          }

          // return data[value][property];
        };
      },
    }
  );
};
