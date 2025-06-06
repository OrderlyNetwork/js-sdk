import { useCallback, useEffect } from "react";
import { compose, head } from "ramda";
import {
  type API,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { calcTPSL_ROI } from "../../orderly/useTakeProfitAndStopLoss/tp_slUtils";
import { OrderCreator } from "../../services/orderCreator/interface";
import {
  baseInputHandle,
  getCalculateHandler,
} from "../../utils/orderEntryHelper";
import { hasTPSL } from "./helper";
import {
  type FullOrderState,
  // useOrderStore,
} from "./orderEntry.store";
import { useOrderStore } from "./useOrderStore";

const useOrderEntryNextInternal = (
  symbol: string,
  options: {
    /**
     * initial order state, default is buy limit order
     *
     */
    initialOrder?: Omit<Partial<FullOrderState>, "symbol">;
    symbolInfo?: API.SymbolExt;
  } = {},
) => {
  // const orderEntity = useOrderEntryFromStore();

  const { symbolInfo } = options;
  const initialOrder = {
    side: OrderSide.BUY,
    order_type: OrderType.LIMIT,
    order_price: "",
    symbol,
    ...options.initialOrder,
  };

  const { actions: orderEntryActions, entry: orderEntity } =
    useOrderStore(initialOrder);

  // const orderEntryActions = useOrderStore((state) => state.actions);

  const calculate = useCallback(
    (
      values: Partial<FullOrderState>,
      fieldName:
        | "symbol"
        | "order_type"
        | "order_type_ext"
        | "order_price"
        | "order_quantity"
        | "order_amount"
        | "visible_quantity"
        | "side"
        | "reduce_only"
        | "slippage"
        | "order_tag"
        | "level"
        | "post_only_adjust"
        | "total"
        | "algo_type"
        | "trigger_price_type"
        | "trigger_price"
        | "child_orders"
        | "tp_pnl"
        | "tp_offset"
        | "tp_offset_percentage"
        | "tp_ROI"
        | "tp_trigger_price"
        | "sl_pnl"
        | "sl_offset"
        | "sl_offset_percentage"
        | "sl_ROI"
        | "sl_trigger_price"
        | "quantity"
        | "price"
        | "type",
      value: any,
      markPrice: number,
      config: API.SymbolExt,
    ): Partial<FullOrderState> => {
      // console.log("calculate", values, fieldName, value, options);
      const fieldHandler = getCalculateHandler(fieldName);

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

  useEffect(() => {
    /// reset the symbol
    orderEntryActions.updateOrderByKey("symbol", symbol);
  }, [orderEntryActions, symbol]);

  const setValue = (
    key: keyof FullOrderState,
    value: any,
    additional?: {
      markPrice: number;
    },
  ) => {
    if (!symbolInfo) {
      orderEntryActions.updateOrderByKey(key, value);
      console.warn("[ORDERLY]:symbolInfo is required to calculate the order");
      return;
    }

    // const values = useOrderStore.getState().entry;
    const { markPrice } = additional ?? { markPrice: 0 };

    let newValues = calculate(
      { ...orderEntity },
      key,
      value,
      markPrice,
      symbolInfo,
    );

    /// if the order type is market or stop market, recalculate the total use mark price
    if (key === "order_type") {
      if (value === OrderType.MARKET || value === OrderType.STOP_MARKET) {
        newValues = calculate(
          newValues,
          "order_price",
          markPrice,
          markPrice,
          symbolInfo,
        );
      }
    }

    if (
      (key === "order_quantity" || key === "order_price") &&
      hasTPSL(newValues)
    ) {
      newValues = calculateTPSL(key, newValues, markPrice, symbolInfo);
    }

    {
      // whether it is necessary to calculate tpsl ROI;
      if (newValues.tp_pnl && newValues.order_quantity) {
        newValues.tp_ROI = calcTPSL_ROI({
          qty: newValues.order_quantity,
          price: newValues.order_price || markPrice,
          pnl: newValues.tp_pnl,
        });
      }

      if (newValues.sl_pnl && newValues.order_quantity) {
        newValues.sl_ROI = calcTPSL_ROI({
          qty: newValues.order_quantity,
          price: newValues.order_price || markPrice,
          pnl: newValues.sl_pnl,
        });
      }
    }

    // calculateTPSL(newValues, markPrice);

    // console.log("newValues++++++", newValues);

    orderEntryActions.updateOrder(newValues);

    return newValues;
  };

  const calculateTPSL = (
    key: string,
    newValues: Partial<FullOrderState>,
    markPrice: number,
    symbolInfo: API.SymbolExt,
  ) => {
    if (key === "order_price") {
      if (typeof newValues.tp_pnl !== "undefined") {
        newValues = calculate(
          newValues,
          "tp_pnl",
          newValues.tp_pnl,
          markPrice,
          symbolInfo,
        );
      }
      if (typeof newValues.sl_pnl !== "undefined") {
        newValues = calculate(
          newValues,
          "sl_pnl",
          newValues.sl_pnl,
          markPrice,
          symbolInfo,
        );
      }
    } else {
      if (typeof newValues.tp_trigger_price !== "undefined") {
        newValues = calculate(
          newValues,
          "tp_trigger_price",
          newValues.tp_trigger_price,
          markPrice,
          symbolInfo,
        );
      }

      if (typeof newValues.sl_trigger_price !== "undefined") {
        newValues = calculate(
          newValues,
          "sl_trigger_price",
          newValues.sl_trigger_price,
          markPrice,
          symbolInfo,
        );
      }
    }

    // whether it is necessary to calculate tpsl ROI;
    // if (newValues.tp_pnl && newValues.order_quantity) {

    //   newValues.tp_ROI = calcTPSL_ROI({
    //     qty: newValues.order_quantity,
    //     price: newValues.order_price || markPrice,
    //     pnl: newValues.tp_pnl,
    //   });
    // }

    // if (newValues.sl_pnl && newValues.order_quantity) {
    //   newValues.sl_ROI = calcTPSL_ROI({
    //     qty: newValues.order_quantity,
    //     price: newValues.order_price || markPrice,
    //     pnl: newValues.sl_pnl,
    //   });
    // }

    return newValues;
  };

  const setValues = (
    values: Partial<FullOrderState>,
    additional?: {
      markPrice: number;
    },
  ) => {
    if (!symbolInfo) {
      orderEntryActions.updateOrder(values);
      console.warn("[ORDERLY]:symbolInfo is required to calculate the order");
      return;
    }

    // const prevValues = useOrderStore.getState().entry;
    let newValues: Partial<FullOrderState> = { ...orderEntity };

    Object.keys(values).forEach((key) => {
      newValues = calculate(
        newValues,
        key as keyof FullOrderState,
        values[key as keyof FullOrderState],
        additional?.markPrice ?? 0,
        symbolInfo!,
      );

      // orderEntryActions.updateOrder(newValues);
    });

    orderEntryActions.updateOrder(newValues);

    return newValues;
  };

  const onMarkPriceUpdated = useCallback(
    (markPrice: number, baseOn: string[] = []) => {
      // console.log("******", baseOn);
      if (!options.symbolInfo) return;
      // const values = useOrderStore.getState().entry;
      let newValues: Partial<FullOrderState> = { ...orderEntity };

      if (baseOn.length === 0) {
        newValues = calculate(
          { ...orderEntity },
          "order_price",
          markPrice,
          markPrice,
          options.symbolInfo!,
        );
      } else {
        baseOn.forEach((key) => {
          newValues = calculate(
            { ...newValues },
            key as keyof FullOrderState,
            orderEntity[key as keyof FullOrderState],
            markPrice,
            options.symbolInfo!,
          );
        });
      }

      // if (typeof baseOn === "undefined") {
      //   newValues = calculate(
      //     { ...orderEntity },
      //     "order_price",
      //     markPrice,
      //     markPrice,
      //     options.symbolInfo
      //   );
      // } else {
      //   newValues = calculate(
      //     { ...orderEntity },
      //     baseOn,
      //     orderEntity[baseOn],
      //     markPrice,
      //     options.symbolInfo
      //   );
      // }

      if (hasTPSL(newValues)) {
        // whether it is necessary to calculate tpsl ROI;
        if (newValues.tp_pnl && newValues.order_quantity) {
          newValues.tp_ROI = calcTPSL_ROI({
            qty: newValues.order_quantity,
            price: newValues.order_price || markPrice,
            pnl: newValues.tp_pnl,
          });
        }

        if (newValues.sl_pnl && newValues.order_quantity) {
          newValues.sl_ROI = calcTPSL_ROI({
            qty: newValues.order_quantity,
            price: newValues.order_price || markPrice,
            pnl: newValues.sl_pnl,
          });
        }
      }

      orderEntryActions.updateOrder(newValues);
    },
    [calculate, options.symbolInfo, orderEntity, orderEntryActions],
  );

  const validate = (
    order: Partial<OrderlyOrder>,
    creator: OrderCreator<any>,
    options: { maxQty: number; markPrice: number; estSlippage?: number | null },
  ) => {
    const { markPrice, maxQty, estSlippage } = options;

    return creator?.validate(order, {
      symbol: symbolInfo!,
      maxQty,
      markPrice,
      estSlippage,
    });
  };

  const generateOrder = (
    creator: OrderCreator<any>,
    options: { maxQty: number; markPrice: number },
  ) => {
    const order = creator.create(orderEntity, {
      ...options,
      symbol: symbolInfo!,
    });

    return order;
  };

  const submitOrder = useCallback(() => {
    // const order = OrderFactory.create(values.type);
    // order.submit(values);
  }, [orderEntity]);

  const resetOrder = (order?: Partial<OrderlyOrder>) => {
    orderEntryActions.resetOrder(order);
  };

  return {
    formattedOrder: orderEntity,
    setValue,
    setValues,
    submit: submitOrder,
    reset: resetOrder,
    generateOrder,
    validate,
    onMarkPriceChange: onMarkPriceUpdated,
  } as const;
};

export { useOrderEntryNextInternal };
