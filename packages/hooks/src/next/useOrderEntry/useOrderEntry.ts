import {
  useCollateral,
  useMaxQty,
  useSymbolsInfo,
} from "../../orderly/orderlyHooks";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import type { FullOrderState } from "./orderEntry.store";
import { API, OrderlyOrder } from "@orderly.network/types";
import { useDebouncedCallback } from "use-debounce";
import { useEventEmitter } from "../../useEventEmitter";
import { OrderFactory } from "../../services/orderCreator/factory";
import { VerifyResult } from "../../services/orderCreator/interface";

type OrderEntryParameters = Parameters<typeof useOrderEntryNextInternal>;
type Options = Omit<OrderEntryParameters["1"], "symbolInfo">;

const useOrderEntryNext = (symbol: string, options: Options) => {
  if (!symbol) {
    throw new Error("symbol is required and must be a string");
  }

  const ee = useEventEmitter();
  const fieldDirty = useRef<{ [K in keyof OrderlyOrder]?: boolean }>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const askAndBid = useRef<number[]>([]); // 0: ask0, 1: bid0

  const [errors, setErrors] = useState<VerifyResult | null>(null);

  const actions = useMarkPriceActions();
  const symbolConfig = useSymbolsInfo();

  const symbolInfo: API.SymbolExt = symbolConfig[symbol]();

  const {
    formattedOrder,
    setValue: setValueInternal,
    setValues: setValuesInternal,
    validate,
    generateOrder,
    // submit,
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
    return {
      markPrice: actions.getMarkPriceBySymbol(symbol),
      maxQty,
    };
  }, [actions, maxQty, symbol]);

  const interactiveValidate = (order: Partial<OrderlyOrder>) => {
    validateFunc(order).then((errors) => {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        setErrors(errors);
      } else {
        setErrors(null);
      }
    });
  };

  const setValue = (key: keyof FullOrderState, value: any) => {
    // console.log("setValue", key, value);
    fieldDirty.current[key] = true;
    const values = setValueInternal(key, value, prepareData());
    if (values) {
      interactiveValidate(values);
    }
  };

  const setValues = (values: Partial<FullOrderState>) => {
    const newValues = setValuesInternal(values, prepareData());
    if (newValues) {
      interactiveValidate(newValues);
    }
  };

  async function validateFunc(order: Partial<OrderlyOrder>) {
    const creator = OrderFactory.create(formattedOrder.order_type);
    return await validate(order, creator, prepareData());
  }

  /**
   * Validate the order
   */
  const validateOrder = (): Promise<VerifyResult | null> => {
    return new Promise<VerifyResult | null>(async (resolve, reject) => {
      const errors = await validateFunc(formattedOrder);
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        reject(errors);
      }
      resolve(null);
    });
  };

  const { freeCollateral, totalCollateral } = useCollateral();

  const submitOrder = async () => {
    /**
     * validate order
     */
    const creator = OrderFactory.create(formattedOrder.order_type);
    const errors = await validate(formattedOrder, creator, prepareData());

    if (Object.keys(errors).length > 0) {
      throw new Error("Order validation failed");
    }
    setSubmitted(true);
    const order = generateOrder(creator, prepareData());
    console.log("submitOrder order:", order);
    // return submit();
  };

  return {
    ...orderEntryActions,
    submit: submitOrder,
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
    metaState: {
      dirty: fieldDirty.current,
      submitted,
      errors,
    },
  };
};

export { useOrderEntryNext };
