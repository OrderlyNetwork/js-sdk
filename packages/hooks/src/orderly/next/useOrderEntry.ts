import { useMarkPriceBySymbol, useSymbolsInfo } from "../orderlyHooks";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";
import { useCallback, useState } from "react";
import { markPriceActions } from "../useMarkPrice/useMarkPriceStore";
import type { FullOrderState } from "./orderEntry.store";

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

  const {
    formattedOrder,
    setValue: setValueInternal,
    setValues: setValuesInternal,
  } = useOrderEntryNextInternal(symbol, {
    ...options,
    symbolInfo: symbolConfig[symbol](),
  });

  const prepareData = useCallback(() => {
    let additionalValue = {
      markPrice: actions.getMarkPriceBySymbol(symbol),
    };
    return additionalValue;
  }, [actions, symbol]);

  const setValue = useCallback(
    (key: keyof FullOrderState, value: any) => {
      setValueInternal(key, value, prepareData());
    },
    [symbol]
  );
  const setValues = useCallback(
    (values: Partial<FullOrderState>) => {
      setValuesInternal(values, prepareData());
    },
    [symbol]
  );

  return {
    formattedOrder,
    setValue,
    setValues,
  };
};

export { useOrderEntryNext };
