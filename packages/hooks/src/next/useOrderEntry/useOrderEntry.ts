import {
  useCollateral,
  useMarkPriceBySymbol,
  useMaxQty,
  useSymbolsInfo,
} from "../../orderly/orderlyHooks";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";
import { useCallback, useMemo, useState } from "react";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import type { FullOrderState } from "./orderEntry.store";
import { API, OrderEntity } from "@orderly.network/types";

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

  const { freeCollateral, totalCollateral } = useCollateral();

  // const estLeverage = useMemo(() => {
  //   if (!accountInfo || !parsedData) return null;
  //   const result = getPriceAndQty(formattedOrder as OrderEntity);
  //   if (result === null || !result.price || !result.quantity) return null;
  //
  //   const leverage = orderUtils.estLeverage({
  //     totalCollateral,
  //     positions,
  //     newOrder: {
  //       symbol: parsedData.symbol,
  //       qty: result.quantity,
  //       price: result.price,
  //     },
  //   });
  //
  //   return leverage;
  // }, []);

  const maxQty = useMaxQty(
    symbol,
    formattedOrder.side,
    formattedOrder.reduce_only
  );

  return {
    formattedOrder,
    maxQty,
    freeCollateral,
    setValue,
    setValues,
    symbolInfo: symbolInfo || {},
  };
};

export { useOrderEntryNext };
