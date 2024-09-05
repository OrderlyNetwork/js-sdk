import { useMarkPriceBySymbol, useSymbolsInfo } from "../orderlyHooks";
import {
  FullOrderState,
  useOrderEntryNextInternal,
} from "./useOrderEntry.internal";
import { useCallback, useState } from "react";
import { markPriceActions } from "../useMarkPrice/useMarkPriceStore";

type OrderEntryParameters = Parameters<typeof useOrderEntryNextInternal>;
type Options = Omit<OrderEntryParameters["1"], "symbolInfo">;

const useOrderEntryNext = (symbol: string, options: Options) => {
  if (!symbol) {
    throw new Error("symbol is required and must be a string");
  }
  // const [ext,setExt] = useState(0);
  // const markPrice = useMarkPriceBySymbol(symbol);
  const actions = markPriceActions();
  const symbolConfig = useSymbolsInfo();

  const { formattedOrder, setValue: setValueInternal } =
    useOrderEntryNextInternal(symbol, {
      ...options,
      symbolInfo: symbolConfig[symbol](),
    });

  const setValue = useCallback(
    (key: keyof FullOrderState, value: any) => {
      let additionalValue = {
        markPrice: actions.getMarkPriceBySymbol(symbol),
      };
      setValueInternal(key, value, additionalValue);
    },
    [symbol]
  );

  return {
    formattedOrder,
    setValue,
  };
};

export { useOrderEntryNext };
