import {
  useCollateral,
  useMaxQty,
  useSymbolsInfo,
} from "../../orderly/orderlyHooks";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import type { FullOrderState } from "./orderEntry.store";
import { API, OrderlyOrder, OrderType } from "@orderly.network/types";
import { useDebouncedCallback } from "use-debounce";
import { useEventEmitter } from "../../useEventEmitter";
import { OrderFactory } from "../../services/orderCreator/factory";
import { VerifyResult } from "../../services/orderCreator/interface";
import { useMutation } from "../../useMutation";
import {
  calcEstLeverage,
  calcEstLiqPrice,
  getCreateOrderUrl,
  getOrderCreator,
  tpslFields,
} from "./helper";
import { produce } from "immer";
import { useAccountInfo } from "../../orderly/appStore";
import { usePositions } from "../../orderly/usePositionStream/usePosition.store";

type OrderEntryParameters = Parameters<typeof useOrderEntryNextInternal>;
type Options = Omit<OrderEntryParameters["1"], "symbolInfo">;

type OrderEntryReturn = {
  submit: (options?: { resetOnSuccess?: boolean }) => Promise<void>;
  reset: () => void;
  resetErrors: () => void;
  resetMetaState: () => void;
  formattedOrder: Partial<FullOrderState>;
  maxQty: number;
  /**
   * The estimated liquidation price.
   */
  estLiqPrice: number | null;
  /**
   * The estimated leverage after order creation.
   */
  estLeverage: number | null;
  helper: {
    /**
     * @deprecated Use `validate` instead.
     */
    validator: () => Promise<VerifyResult | null>;
    /**
     * Function to validate the order.
     * @returns {Promise<VerifyResult | null>} The validation result.
     */
    validate: () => Promise<VerifyResult | null>;
  };
  freeCollateral: number;
  /**
   * set a single value to the order data;
   * @param key
   * @param value
   * @returns
   */
  setValue: (
    key: keyof FullOrderState,
    value: any,
    options?: {
      shouldUpdateLastChangedField?: boolean;
    }
  ) => void;
  setValues: (values: Partial<FullOrderState>) => void;
  symbolInfo: API.SymbolExt;
  /**
   * Meta state including validation and submission status.
   */
  metaState: {
    dirty: { [K in keyof OrderlyOrder]?: boolean };
    submitted: boolean;
    validated: boolean;
    errors: VerifyResult | null;
  };
  /**
   * Indicates if a mutation (order creation) is in progress.
   */
  isMutating: boolean;

  markPrice: number | undefined;
};

/**
 * Custom hook for managing order entry in the Orderly application.
 *
 * @param {string} symbol - The symbol for which the order is being created. This parameter is required.
 *
 * @param {Options} options - Additional options for configuring the order entry.
 *
 * @returns {OrderEntryReturn} An object containing various actions and state related to order entry.
 *
 * @throws {Error} Throws an error if the symbol is not provided or is not a string.
 *
 * @example
 * ```typescript
 * const {
 *   submit,
 *   formattedOrder, //
 *   setValue,
 *   setValues,
 *   symbolInfo,
 *   metaState,
 *   isMutating,
 *  // maxQty, freeCollateral ... same as v1
 * } = useOrderEntry('BTC_USDC_PERP', options);
 *
 * // update the order type
 * setValue('order_type', OrderType.LIMIT);
 * // update the order price
 * setValue('order_price', '70000');
 * // update the order quantity
 * setValue('order_quantity', 1);
 *
 * // how to set TP/SL
 * setValue('tp_trigger_price', '71000'); // directly set TP trigger price
 * // or set the tp pnl, the TP trigger price will be calculated based on the current order price
 * // setValue('tp_pnl', '300'); // you can also set tp_offset or tp_offset_percentage, same as the usage of useTPSL hook;
 * // SL is similar to TP setting
 * setValue('sl_price', '69000');
 *
 * // Submit the order data to the backend, and reset the hook state after the order is successfully created.
 * // Note: If the order data is invalid, an error will be thrown.
 * // If you want to retain the current order data after a successful order creation,
 * // you can pass {resetOnSuccess: false} to `submit` function to prevent the hook from automatically resetting the order status.
 * // Of course, you can also call `reset()` to manually reset the order status and use `resetMetaState()` to clear the error state.
 * await submit();
 * ```
 */
const useOrderEntry = (symbol: string, options: Options): OrderEntryReturn => {
  if (!symbol) {
    throw new Error("symbol is required and must be a string");
  }

  const ee = useEventEmitter();
  const fieldDirty = useRef<{ [K in keyof OrderlyOrder]?: boolean }>({});
  const [meta, setMeta] = useState<{
    dirty: { [K in keyof OrderlyOrder]?: boolean };
    submitted: boolean;
    validated: boolean;
    errors: VerifyResult | null;
  }>({
    dirty: {},
    submitted: false,
    validated: false,
    errors: null,
  });

  const askAndBid = useRef<number[]>([]); // 0: ask0, 1: bid0
  const lastChangedField = useRef<keyof FullOrderState | undefined>();

  // const [errors, setErrors] = useState<VerifyResult | null>(null);

  const actions = useMarkPriceActions();
  const symbolConfig = useSymbolsInfo();
  const accountInfo = useAccountInfo();
  const positions = usePositions();

  const symbolInfo: API.SymbolExt = symbolConfig[symbol]();
  const markPrice = actions.getMarkPriceBySymbol(symbol);

  const {
    formattedOrder,
    setValue: setValueInternal,
    setValues: setValuesInternal,
    validate,
    generateOrder,
    reset,
    // submit,
    ...orderEntryActions
  } = useOrderEntryNextInternal(symbol, {
    ...options,
    symbolInfo,
  });

  const [doCreateOrder, { isMutating }] = useMutation<OrderlyOrder, any>(
    getCreateOrderUrl(formattedOrder)
  );

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

  useEffect(() => {
    // console.log("markPrice", markPrice);

    if (
      (formattedOrder.order_type === OrderType.MARKET ||
        formattedOrder.order_type === OrderType.STOP_MARKET) &&
      markPrice
    ) {
      orderEntryActions.onMarkPriceChange(
        markPrice,
        lastChangedField.current as any
      );
    }
  }, [markPrice, formattedOrder.order_type]);

  const prepareData = useCallback(() => {
    return {
      markPrice: actions.getMarkPriceBySymbol(symbol),
      maxQty,
    };
  }, [maxQty, symbol]);

  const interactiveValidate = (order: Partial<OrderlyOrder>) => {
    validateFunc(order).then((errors) => {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        setMeta(
          produce((draft) => {
            draft.errors = errors;
          })
        );
      } else {
        setMeta(
          produce((draft) => {
            draft.errors = null;
          })
        );
      }
    });
  };

  const canSetTPSLPrice = (key: keyof OrderlyOrder, orderType: OrderType) => {
    if (
      tpslFields.includes(key) &&
      orderType !== OrderType.LIMIT &&
      orderType !== OrderType.MARKET
    ) {
      console.warn("Only limit order can be set tp/sl");
      return false;
    }

    return true;
  };

  const setValue = (
    key: keyof FullOrderState,
    value: any,
    options?: {
      shouldUpdateLastChangedField?: boolean;
    }
  ) => {
    const { shouldUpdateLastChangedField = true } = options || {};
    if (!canSetTPSLPrice(key, formattedOrder.order_type)) {
      return;
    }
    fieldDirty.current[key] = true;
    const values = setValueInternal(key, value, prepareData());

    if (values) {
      interactiveValidate(values);
    }

    if (shouldUpdateLastChangedField) {
      lastChangedField.current = key;
    }
  };

  const setValues = (values: Partial<FullOrderState>) => {
    if (
      !Object.keys(values).every((key) =>
        canSetTPSLPrice(key as keyof FullOrderState, formattedOrder.order_type)
      )
    ) {
      return;
    }

    const newValues = setValuesInternal(values, prepareData());
    if (newValues) {
      interactiveValidate(newValues);
    }
  };

  async function validateFunc(order: Partial<OrderlyOrder>) {
    const creator = getOrderCreator(order);

    return validate(order, creator, prepareData());
  }

  /**
   * Validate the order
   */
  const validateOrder = (): Promise<VerifyResult | null> => {
    return new Promise<VerifyResult | null>(async (resolve, reject) => {
      const creator = getOrderCreator(formattedOrder);

      const errors = await validate(formattedOrder, creator, prepareData());
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        // setErrors(errors);
        setMeta(
          produce((draft) => {
            draft.errors = errors;
          })
        );
        if (!meta.validated) {
          // setMeta((prev) => ({ ...prev, validated: true }));
          setMeta(
            produce((draft) => {
              draft.validated = true;
            })
          );
        }
        reject(errors);
      }
      // create order
      const order = generateOrder(creator, prepareData());
      resolve(order);
    });
  };

  const { freeCollateral, totalCollateral } = useCollateral();

  const estLiqPrice = useMemo(() => {
    const markPrice = actions.getMarkPriceBySymbol(symbol);
    if (!markPrice || !accountInfo) return null;

    return calcEstLiqPrice(formattedOrder, askAndBid.current, {
      baseIMR: symbolInfo?.base_imr,
      baseMMR: symbolInfo?.base_mmr,
      markPrice,
      totalCollateral,
      futures_taker_fee_rate: accountInfo.futures_taker_fee_rate,
      imr_factor: accountInfo.imr_factor[symbol],
      symbol,
      positions,
    });
  }, [formattedOrder, accountInfo, positions, totalCollateral, symbol]);

  const estLeverage = useMemo(() => {
    return calcEstLeverage(formattedOrder, askAndBid.current, {
      totalCollateral,
      positions,
      symbol,
    });
  }, [formattedOrder, accountInfo, positions, totalCollateral, symbol]);

  const resetErrors = () => {
    setMeta(
      produce((draft) => {
        draft.errors = null;
      })
    );
  };

  const resetMetaState = () => {
    setMeta(
      produce((draft) => {
        draft.errors = null;
        draft.submitted = false;
        draft.validated = false;
        draft.dirty = {};
      })
    );
  };

  const submitOrder = async () => {
    /**
     * validate order
     */
    const creator = getOrderCreator(formattedOrder);
    const errors = await validate(formattedOrder, creator, prepareData());
    // setMeta((prev) => ({ ...prev, submitted: true, validated: true }));
    setMeta(
      produce((draft) => {
        draft.submitted = true;
        draft.validated = true;
      })
    );
    if (Object.keys(errors).length > 0) {
      setMeta(
        produce((draft) => {
          draft.errors = errors;
        })
      );
      throw new Error("Order validation failed");
    }

    const order = generateOrder(creator, prepareData());

    const result = await doCreateOrder(order);

    if (result.success) {
      reset();
      resetMetaState();
    }
    return result;
    // return submit();
  };

  return {
    ...orderEntryActions,
    submit: submitOrder,
    reset,
    resetErrors,
    resetMetaState,
    formattedOrder,
    maxQty,
    estLiqPrice,
    estLeverage,
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
    metaState: meta,
    isMutating,
    markPrice,
  };
};

export { useOrderEntry };
