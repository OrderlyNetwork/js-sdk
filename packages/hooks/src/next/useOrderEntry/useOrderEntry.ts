import {
  useMarkPriceBySymbol,
  useSymbolsInfo,
} from "../../orderly/orderlyHooks";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";
import { useCallback, useState } from "react";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import type { FullOrderState } from "./orderEntry.store";
import { API } from "@orderly.network/types";

type OrderEntryParameters = Parameters<typeof useOrderEntryNextInternal>;
type Options = Omit<OrderEntryParameters["1"], "symbolInfo">;

const useOrderEntryNext = (symbol: string, options: Options) => {
  if (!symbol) {
    throw new Error("symbol is required and must be a string");
  }
  // const [ext,setExt] = useState(0);
  // const markPrice = useMarkPriceBySymbol(symbol);
  const actions = useMarkPriceActions();
  const symbolConfig = useSymbolsInfo();
  const symbolInfo: API.SymbolExt = symbolConfig[symbol]();

  const {
    formattedOrder,
    setValue: setValueInternal,
    setValues: setValuesInternal,
  } = useOrderEntryNextInternal(symbol, {
    ...options,
    symbolInfo,
  });

  const prepareData = useCallback(() => {
    let additionalValue = {
      markPrice: actions.getMarkPriceBySymbol(symbol),
    };
    return additionalValue;
  }, [actions, symbol]);

  const setValue = (key: keyof FullOrderState, value: any) => {
    setValueInternal(key, value, prepareData());
  };
  const setValues = (values: Partial<FullOrderState>) => {
    setValuesInternal(values, prepareData());
  };

  return {
    formattedOrder,
    setValue,
    setValues,
    symbolInfo: symbolInfo || {},
  };
};

export { useOrderEntryNext };
