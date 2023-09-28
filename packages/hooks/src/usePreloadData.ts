import { useContext } from "react";
import { OrderlyContext, useQuery, useSWR } from ".";

export const usePreLoadData = (onSuccess: (name: string) => void) => {
  //   const { onAppTestChange } = useContext(OrderlyContext);
  useSWR(
    "https://fi-api.woo.org/swap_support",
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
