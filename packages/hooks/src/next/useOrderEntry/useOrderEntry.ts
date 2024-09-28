import {
  useCollateral,
  useMaxQty,
  useSymbolsInfo,
} from "../../orderly/orderlyHooks";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import type { FullOrderState } from "./orderEntry.store";
import { API, OrderlyOrder } from "@orderly.network/types";
import { useDebouncedCallback } from "use-debounce";
import { useEventEmitter } from "../../useEventEmitter";
import { OrderFactory } from "../../services/orderCreator/factory";
import { VerifyResult } from "../../services/orderCreator/interface";
import { useMutation } from "../../useMutation";
import {
  calcEstLeverage,
  calcEstLiqPrice,
  getCreateOrderUrl,
  getPriceAndQty,
  tpslFields,
} from "./helper";
import { produce } from "immer";
import { order as orderUtils } from "@orderly.network/perp";
import { OrderType } from "@orderly.network/types";
import { useAccountInfo } from "../../orderly/appStore";
import {
  usePositions,
  usePositionStore,
} from "../../orderly/usePositionStream/usePositionStore";

type OrderEntryParameters = Parameters<typeof useOrderEntryNextInternal>;
type Options = Omit<OrderEntryParameters["1"], "symbolInfo">;

const useOrderEntryNext = (symbol: string, options: Options) => {
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
  // const [submitted, setSubmitted] = useState<boolean>(false);
  // const [validated, setValidated] = useState<boolean>(false);
  const askAndBid = useRef<number[]>([2558.14, 2489.75]); // 0: ask0, 1: bid0

  // const [errors, setErrors] = useState<VerifyResult | null>(null);

  const actions = useMarkPriceActions();
  const symbolConfig = useSymbolsInfo();
  const accountInfo = useAccountInfo();
  const positions = usePositions();

  const symbolInfo: API.SymbolExt = symbolConfig[symbol]();

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

  const setValue = (key: keyof FullOrderState, value: any) => {
    if (!canSetTPSLPrice(key, formattedOrder.order_type)) {
      return;
    }
    fieldDirty.current[key] = true;
    const values = setValueInternal(key, value, prepareData());

    if (values) {
      interactiveValidate(values);
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
    const creator = OrderFactory.create(order.order_type!);

    return await validate(order, creator, prepareData());
  }

  /**
   * Validate the order
   */
  const validateOrder = (): Promise<VerifyResult | null> => {
    return new Promise<VerifyResult | null>(async (resolve, reject) => {
      const creator = OrderFactory.create(formattedOrder.order_type!);

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

    const result = calcEstLiqPrice(formattedOrder, askAndBid.current, {
      baseIMR: symbolInfo.base_imr,
      baseMMR: symbolInfo.base_mmr,
      markPrice,
      totalCollateral,
      futures_taker_fee_rate: accountInfo.futures_taker_fee_rate,
      imr_factor: accountInfo.imr_factor[symbol],
      symbol,
      positions,
    });

    return result;
  }, [formattedOrder, accountInfo, positions, totalCollateral, symbol]);

  const estLeverage = useMemo(() => {
    const result = calcEstLeverage(formattedOrder, askAndBid.current, {
      totalCollateral,
      positions,
      symbol,
    });

    return result;
  }, [formattedOrder, accountInfo, positions, totalCollateral, symbol]);

  const submitOrder = async () => {
    /**
     * validate order
     */
    const creator = OrderFactory.create(formattedOrder.order_type);
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
      setMeta(
        produce((draft) => {
          draft.errors = null;
          draft.submitted = false;
          draft.validated = false;
          draft.dirty = {};
        })
      );
    }
    // return submit();
  };

  const resetErrors = () => {
    setMeta(
      produce((draft) => {
        draft.errors = null;
      })
    );
  };

  return {
    ...orderEntryActions,
    submit: submitOrder,
    reset,
    resetErrors,
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
  };
};

export { useOrderEntryNext };
