import { useContext } from "react";
import { OrderlyContext, useQuery, useSWR } from ".";

export const usePreLoadData = (onSuccess: (name: string) => void) => {
  const { configStore } = useContext(OrderlyContext);

  useSWR(
    `${configStore.get("swapSupportApiUrl")}/swap_support`,
    (url) => fetch(url).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      //   suspense: true,
      onSuccess: (data, key, config) => {
        onSuccess("chains_fetch");
      },
    }
  );
  //   useQuery("");
};
