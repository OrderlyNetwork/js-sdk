import { useCallback, useEffect, useState, useRef } from "react";
import { compose, head } from "ramda";
import {
  type API,
  OrderlyOrder,
  OrderSide,
  OrderType,
  MarginMode,
} from "@orderly.network/types";
import {
  getTPSLExecutionType,
  isTPSLCalculationField,
  priceToROI,
  refreshTPSLValues,
} from "../../orderly/useTakeProfitAndStopLoss/tp_slUtils";
import { OrderCreator } from "../../services/orderCreator/interface";
import {
  baseInputHandle,
  getCalculateHandler,
} from "../../utils/orderEntryHelper";
import { type FullOrderState } from "./orderEntry.store";

const initialOrderState = {
  order_price: "",
  order_quantity: "",
  trigger_price: "",
  tp_trigger_price: "",
  sl_trigger_price: "",
  total: "",
  symbol: "",
  side: OrderSide.BUY,
  order_type: OrderType.LIMIT,
  margin_mode: MarginMode.CROSS,
};

const normalizeInitialOrder = (
  order?: Partial<FullOrderState>,
): Omit<Partial<FullOrderState>, "symbol"> | undefined => {
  if (!order) {
    return undefined;
  }

  const rest = { ...order };
  delete rest.symbol;
  return rest;
};

const useOrderEntryNextInternal = (
  symbol: string,
  options: {
    /**
     * initial order state, default is buy limit order
     *
     */
    initialOrder?: Omit<Partial<FullOrderState>, "symbol">;
    symbolInfo?: API.SymbolExt;
    symbolLeverage?: number;
    /** Trigger prices owned by an already triggered TP/SL order. */
    lockedTPSLTriggers?: Partial<Record<"tp" | "sl", string | number>>;
  } = {},
) => {
  const { symbolInfo, symbolLeverage, lockedTPSLTriggers } = options;
  const marketInputs = useRef<
    Partial<
      Record<
        "tp" | "sl",
        {
          key: keyof FullOrderState;
          value: string | number;
        }
      >
    >
  >({});
  const initialOrder = normalizeInitialOrder(options.initialOrder);

  // Use local state instead of global zustand store to avoid state pollution
  // between different instances (e.g., OrderEntry form and TPSL edit modal)
  const [orderEntity, setOrderEntity] = useState<FullOrderState>(
    () =>
      ({
        ...initialOrderState,
        ...initialOrder,
        symbol,
      }) as FullOrderState,
  );

  // Event callbacks can update the form in the same render batch.
  const currentOrder = useRef(orderEntity);
  const updateOrder = (changes: Partial<FullOrderState>) => {
    currentOrder.current = { ...currentOrder.current, ...changes, symbol };
    setOrderEntity(currentOrder.current);
  };

  useEffect(() => {
    marketInputs.current = {};
    currentOrder.current = {
      ...initialOrderState,
      ...initialOrder,
      symbol,
    } as FullOrderState;
    setOrderEntity(currentOrder.current);
  }, [symbol]);

  const calculate = useCallback(
    (
      values: Partial<FullOrderState>,
      fieldName: keyof FullOrderState,
      value: any,
      markPrice: number,
      config: API.SymbolExt,
      lockTrigger?: boolean,
    ): Partial<FullOrderState> => {
      // console.log("calculate", values, fieldName, value, options);
      const fieldHandler = getCalculateHandler(fieldName, lockTrigger);
      if (isTPSLCalculationField(fieldName)) {
        return fieldHandler([values, fieldName, value, markPrice, config])[0];
      }

      const newValues = compose<any, any, any, Partial<FullOrderState>>(
        head,
        // orderEntityFormatHandle(baseDP, quoteDP),
        fieldHandler,
        baseInputHandle,
      )([values, fieldName, value, markPrice, config]);

      // if fieldName is quantity/price,recalculate the tp/sl

      return newValues as Partial<FullOrderState>;
    },
    [],
  );

  const applyField = (
    currentEntry: Partial<FullOrderState>,
    key: keyof FullOrderState,
    value: any,
    markPrice: number,
  ) => {
    const leg = key.startsWith("tp_")
      ? "tp"
      : key.startsWith("sl_")
        ? "sl"
        : undefined;
    const calculated = isTPSLCalculationField(key);
    const locked = leg !== undefined && lockedTPSLTriggers?.[leg] !== undefined;
    if (
      leg &&
      locked &&
      (key === `${leg}_trigger_price` ||
        (calculated &&
          (getTPSLExecutionType(currentEntry, leg) !== OrderType.LIMIT ||
            !Number(currentEntry[`${leg}_trigger_price`]))))
    )
      return currentEntry;

    if (
      leg &&
      (key === `${leg}_trigger_price` || key === `${leg}_order_type`)
    ) {
      delete marketInputs.current[leg];
    } else if (
      leg &&
      calculated &&
      !locked &&
      getTPSLExecutionType(currentEntry, leg) === OrderType.MARKET
    ) {
      marketInputs.current[leg] = { key, value };
    }

    return symbolInfo
      ? calculate(currentEntry, key, value, markPrice, symbolInfo, locked)
      : { ...currentEntry, [key]: value };
  };

  const setValue = (
    key: keyof FullOrderState,
    value: any,
    additional?: { markPrice: number },
  ) => {
    const { markPrice } = additional ?? { markPrice: 0 };
    const current = { ...currentOrder.current };
    let newValues = applyField(current, key, value, markPrice);
    if (newValues === current) return;
    if (!symbolInfo) {
      updateOrder(newValues);
      console.warn("[ORDERLY]:symbolInfo is required to calculate the order");
      return newValues;
    }

    if (
      key === "order_type" &&
      (value === OrderType.MARKET || value === OrderType.STOP_MARKET)
    ) {
      newValues = calculate(
        newValues,
        "order_price",
        markPrice,
        markPrice,
        symbolInfo,
      );
    }
    if (key === "order_quantity" || key === "order_price" || key === "total") {
      newValues = refreshOrderTPSL(
        newValues,
        markPrice,
        key === "total" ? "order_quantity" : key,
      );
    } else {
      Object.assign(
        newValues,
        priceToROI({ values: newValues, symbolLeverage, markPrice }),
      );
    }

    updateOrder(newValues);
    return newValues;
  };

  const refreshOrderTPSL = (
    values: Partial<FullOrderState>,
    markPrice: number,
    source: "order_quantity" | "order_price" | "mark" | "sync",
  ) => {
    if (!symbolInfo) return values;
    const newValues = { ...values };
    const entryPrice =
      values.order_type === OrderType.MARKET ||
      values.order_type === OrderType.STOP_MARKET
        ? markPrice
        : Number(values.order_price);
    const side = values.side ?? OrderSide.BUY;

    for (const leg of ["tp", "sl"] as const) {
      const input = marketInputs.current[leg];
      const usesMark = input?.key.endsWith("_from_mark");
      const shouldReplay =
        source === "mark" ||
        (source === "order_price" &&
          (usesMark || input?.key.endsWith("_pnl"))) ||
        (source === "order_quantity" && usesMark);
      if (
        input &&
        shouldReplay &&
        lockedTPSLTriggers?.[leg] === undefined &&
        getTPSLExecutionType(newValues, leg) === OrderType.MARKET
      ) {
        Object.assign(
          newValues,
          calculate(newValues, input.key, input.value, markPrice, symbolInfo),
        );
      }
      Object.assign(
        newValues,
        refreshTPSLValues(
          leg,
          {
            values: newValues,
            entryPrice,
            markPrice,
            qty:
              Number(values.order_quantity) * (side === OrderSide.BUY ? 1 : -1),
            orderSide: side,
          },
          { symbol: symbolInfo },
        ),
      );
    }

    return Object.assign(
      newValues,
      priceToROI({ values: newValues, symbolLeverage, markPrice }),
    );
  };

  const setValues = (
    values: Partial<FullOrderState>,
    additional?: {
      markPrice: number;
    },
  ) => {
    const markPrice = additional?.markPrice ?? 0;
    let newValues: Partial<FullOrderState> = { ...currentOrder.current };
    for (const key of Object.keys(values) as (keyof FullOrderState)[]) {
      newValues = applyField(newValues, key, values[key], markPrice);
    }

    if (
      "order_price" in values ||
      "order_quantity" in values ||
      "total" in values
    ) {
      newValues = refreshOrderTPSL(
        newValues,
        additional?.markPrice ?? 0,
        "sync",
      );
    } else {
      Object.assign(
        newValues,
        priceToROI({ values: newValues, symbolLeverage, markPrice }),
      );
    }
    updateOrder(newValues);

    return newValues;
  };

  /**
   * Raw merge setter for externally computed TPSL bundles.
   *
   * IMPORTANT: This intentionally skips `calculate()` to avoid overwriting user/advanced computed
   * fields (e.g. `sl_trigger_price`) via chained recomputation from other derived inputs.
   */
  const setValuesRaw = (
    values: Partial<FullOrderState>,
    markPrice?: number,
  ) => {
    let newValues: Partial<FullOrderState> = {
      ...currentOrder.current,
      ...values,
    };
    for (const leg of ["tp", "sl"] as const) {
      const triggerKey = `${leg}_trigger_price` as const;
      const lockedTrigger = lockedTPSLTriggers?.[leg];
      if (triggerKey in values || `${leg}_order_type` in values) {
        delete marketInputs.current[leg];
      }
      if (lockedTrigger !== undefined)
        newValues[triggerKey] = String(lockedTrigger);
    }
    if (markPrice !== undefined) {
      newValues = refreshOrderTPSL(newValues, markPrice, "sync");
    }
    updateOrder(newValues);
    return newValues;
  };

  const onMarkPriceUpdated = (
    markPrice: number,
    lastChangedField?: keyof FullOrderState,
  ) => {
    if (!symbolInfo) return;
    let newValues: Partial<FullOrderState> = { ...currentOrder.current };
    const isMarket =
      newValues.order_type === OrderType.MARKET ||
      newValues.order_type === OrderType.STOP_MARKET;
    if (isMarket) {
      const mainField =
        lastChangedField &&
        !lastChangedField.startsWith("tp_") &&
        !lastChangedField.startsWith("sl_")
          ? lastChangedField
          : undefined;
      newValues = calculate(
        newValues,
        mainField ?? "order_price",
        mainField ? newValues[mainField] : markPrice,
        markPrice,
        symbolInfo,
      );
    }
    updateOrder(
      refreshOrderTPSL(newValues, markPrice, isMarket ? "mark" : "sync"),
    );
  };

  const validate = (
    order: Partial<OrderlyOrder>,
    creator: OrderCreator<any>,
    options: {
      maxQty: number;
      markPrice: number;
      estSlippage?: number | null;
      askAndBid?: number[];
    },
  ) => {
    return creator?.validate(order, {
      ...options,
      symbol: symbolInfo!,
      skipTPSLTriggerPriceAgainstMark: lockedTPSLTriggers && {
        tp:
          lockedTPSLTriggers.tp !== undefined &&
          Number(order.tp_trigger_price) === Number(lockedTPSLTriggers.tp),
        sl:
          lockedTPSLTriggers.sl !== undefined &&
          Number(order.sl_trigger_price) === Number(lockedTPSLTriggers.sl),
      },
    });
  };

  const generateOrder = (
    creator: OrderCreator<any>,
    options: {
      maxQty: number;
      markPrice: number;
      estSlippage?: number | null;
      askAndBid?: number[];
    },
  ) => {
    const order = creator.create(
      {
        ...orderEntity,
        symbol,
      },
      {
        ...options,
        symbol: symbolInfo!,
      },
    );

    return order;
  };

  const submitOrder = useCallback(() => {
    // const order = OrderFactory.create(values.type);
    // order.submit(values);
  }, [orderEntity]);

  const resetOrder = () => {
    marketInputs.current = {};
    updateOrder({
      order_price: "",
      order_quantity: "",
      trigger_price: "",
      total: "",
      tp_trigger_price: "",
      tp_order_price: "",
      tp_pnl: "",
      tp_ROI: undefined,
      tp_offset: "",
      tp_offset_percentage: "",
      tp_offset_from_mark: "",
      tp_offset_percentage_from_mark: "",
      sl_trigger_price: "",
      sl_order_price: "",
      sl_pnl: "",
      sl_ROI: undefined,
      sl_offset: "",
      sl_offset_percentage: "",
      sl_offset_from_mark: "",
      sl_offset_percentage_from_mark: "",
    });
  };

  return {
    formattedOrder: orderEntity,
    setValue,
    setValues,
    setValuesRaw,
    submit: submitOrder,
    reset: resetOrder,
    generateOrder,
    validate,
    onMarkPriceChange: onMarkPriceUpdated,
  } as const;
};

export { useOrderEntryNextInternal };
