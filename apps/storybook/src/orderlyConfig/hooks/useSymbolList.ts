import { useCallback } from "react";
import { useMatch } from "react-router";
import { OrderlyAppProviderProps } from "@orderly.network/react-app";

export function useIsRwaRoute() {
  // match /:lang/rwa or /:lang/rwa/:symbol
  const match = useMatch("/:lang/rwa/*");
  return Boolean(match);
}

type SymbolListType = NonNullable<
  NonNullable<OrderlyAppProviderProps["dataAdapter"]>["symbolList"]
>;

export const useSymbolList = () => {
  const isRwaRoute = useIsRwaRoute();

  return useCallback<SymbolListType>(
    (original, { rwaSymbolsInfo }) => {
      if (isRwaRoute) {
        return original.filter((item) => !!rwaSymbolsInfo[item.symbol]);
      }
      return original;
    },
    [isRwaRoute],
  );
};
