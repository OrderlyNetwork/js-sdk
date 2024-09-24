import {
  useCollateral,
  useMarkPriceBySymbol,
  useMaxQty,
  useSymbolsInfo,
} from "../../orderly/orderlyHooks";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import type { FullOrderState } from "./orderEntry.store";
import { API, OrderEntity } from "@orderly.network/types";
import { useDebouncedCallback } from "use-debounce";
import { useEventEmitter } from "../../useEventEmitter";

type OrderEntryParameters = Parameters<typeof useOrderEntryNextInternal>;
type Options = Omit<OrderEntryParameters["1"], "symbolInfo">;

const useOrderEntryNext = (symbol: string, options: Options) => {
  if (!symbol) {
    throw new Error("symbol is required and must be a string");
  }

  const ee = useEventEmitter();
  const fieldDirty = useRef<{ [K in keyof OrderEntity]?: boolean }>({});
  const submitted = useRef<boolean>(false);
  const askAndBid = useRef<number[]>([]); // 0: ask0, 1: bid0

  // const [ext,setExt] = useState(0);
  // const markPrice = useMarkPriceBySymbol(symbol);
  const actions = useMarkPriceActions();
  const symbolConfig = useSymbolsInfo();

  const symbolInfo: API.SymbolExt = symbolConfig[symbol]();

  const {
    formattedOrder,
    setValue: setValueInternal,
    setValues: setValuesInternal,
    validate,
    ...orderEntryActions
  } = useOrderEntryNextInternal(symbol, {
    ...options,
    symbolInfo,
  });
  const maxQty = useMaxQty(
    symbol,
    formattedOrder.side,
    formattedOrder.reduce_only
  );
  const onOrderBookUpdate = useDebouncedCallback((data: number[]) => {
    askAndBid.current = data;
  }, 200);

  /**
   * TODO: remove this when orderBook calc is moved to the calculation service
   */
  useEffect(() => {
    ee.on("orderbook:update", onOrderBookUpdate);

    return () => {
      ee.off("orderbook:update", onOrderBookUpdate);
    };
  }, []);

  const prepareData = useCallback(() => {
    let additionalValue = {
      markPrice: actions.getMarkPriceBySymbol(symbol),
      maxQty,
    };
    return additionalValue;
  }, [actions, maxQty, symbol]);

  const setValue = (key: keyof FullOrderState, value: any) => {
    console.log("setValue", key, value);
    setValueInternal(key, value, prepareData());
  };

  const setValues = (values: Partial<FullOrderState>) => {
    setValuesInternal(values, prepareData());
  };

  const validateOrder = useCallback(() => {
    return new Promise<void>(async (resolve, reject) => {
      const errors = await validate(prepareData());
      if (!!errors) {
        reject(errors);
      }
      resolve();
    });
  }, [validate, prepareData]);

  const { freeCollateral, totalCollateral } = useCollateral();

  // const estLeverage = useMemo(() => {
  //   if (!accountInfo || !parsedData) return null;
  //   const result = getPriceAndQty(formattedOrder as OrderEntity);
  //   if (result === null || !result.price || !result.quantity) return null;

  //   const leverage = orderUtils.estLeverage({
  //     totalCollateral,
  //     positions,
  //     newOrder: {
  //       symbol: parsedData.symbol,
  //       qty: result.quantity,
  //       price: result.price,
  //     },
  //   });

  //   return leverage;
  // }, []);

  return {
    ...orderEntryActions,
    formattedOrder,
    maxQty,
    helper: {
      /**
       * @deprecated use validate instead
       */
      validator: validateOrder,
      validate: validateOrder,
    },
    freeCollateral,
    setValue,
    setValues,
    symbolInfo: symbolInfo || {},
  };
};

export { useOrderEntryNext };
