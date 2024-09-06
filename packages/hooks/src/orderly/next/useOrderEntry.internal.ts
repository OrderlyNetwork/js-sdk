import { create } from "zustand";
import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  type API,
  BracketOrderEntry,
  OrderEntity,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";

import { useCallback, useEffect } from "react";
import {
  baseInputHandle,
  getCalculateHandler,
} from "../../utils/orderEntryHelper";
import { compose, head } from "ramda";
import { tpslCalculateHelper } from "../useTakeProfitAndStopLoss/tp_slUtils";
import { OrderFactory } from "../../services/orderCreator/factory";
import {
  type FullOrderState,
  useOrderEntryFromStore,
  useOrderStore,
} from "./orderEntry.store";

type BaseOrderEntity = {
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
};

type BracketOrderEntryChild = {
  symbol: string;
  algo_type: AlgoOrderRootType;
  child_orders: BracketOrderEntryChild[];
};

const useOrderEntryNextInternal = (
  symbol: string,
  options: {
    /**
     * initial order state, default is buy limit order
     *
     */
    initialOrder?: Omit<Partial<FullOrderState>, "symbol">;
    symbolInfo?: Pick<API.SymbolExt, "base_dp" | "quote_dp">;
  } = {}
) => {
  const orderEntity = useOrderEntryFromStore();

  const {
    // markPrice,
    initialOrder = {
      side: OrderSide.BUY,
      type: OrderType.LIMIT,
    },
  } = options;

  const orderEntryActions = useOrderStore((state) => state.actions);

  const calculate = useCallback(
    (
      values: Partial<FullOrderState>,
      fieldName: keyof FullOrderState,
      value: any,
      markPrice: number,
      config: Pick<API.SymbolExt, "base_dp" | "quote_dp">
    ): Partial<FullOrderState> => {
      // console.log("calculate", values, fieldName, value, options);
      const fieldHandler = getCalculateHandler(fieldName);
      // const price = values.type===OrderType.LIMIT ||  values.price;

      let newValues = compose<any, any, any, Partial<FullOrderState>>(
        head,
        // orderEntityFormatHandle(baseDP, quoteDP),
        fieldHandler,
        baseInputHandle
      )([values, fieldName, value, markPrice, config]);

      //whether tpsl calculation is necessary

      if (
        "algo_type" in newValues &&
        !!newValues.price &&
        !!newValues.quantity &&
        (newValues.algo_type === AlgoOrderRootType.TP_SL ||
          newValues.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL ||
          newValues.algo_type === AlgoOrderRootType.BRACKET)
      ) {
        newValues = tpslCalculateHelper(
          fieldName,
          {
            key: fieldName,
            value,
            entryPrice: newValues.price, // order price or mark price
            qty: newValues.quantity,
            orderSide: newValues.side!,
            // values: newValues,
          },
          {
            symbol: options.symbolInfo,
          }
        );
      }

      return newValues as Partial<FullOrderState>;
    },
    []
  );

  useEffect(() => {
    if (initialOrder) {
      orderEntryActions.restoreOrder(initialOrder);
    }
  }, []);

  useEffect(() => {
    /// reset the symbol
    orderEntryActions.updateOrderByKey("symbol", symbol);
  }, [symbol]);

  // const validator = (values: any) => {
  //   // @ts-ignore
  //   const creator = OrderFactory.create(values.order_type);
  //
  //   return creator?.validate(values, {
  //     symbol: symbolInfo[symbol](),
  //     // token: tokenInfo[symbol](),
  //     maxQty,
  //     markPrice: markPrice,
  //   });
  // };

  const validate = useCallback(() => {}, []);

  const setValue = useCallback(
    (
      key: keyof FullOrderState,
      value: any,
      additional?: {
        markPrice: number;
      }
    ) => {
      if (!options.symbolInfo) {
        orderEntryActions.updateOrderByKey(key, value);
        console.warn("[ORDERLY]:symbolInfo is required to calculate the order");
        return;
      }

      const values = useOrderStore.getState().entry;

      const newValues = calculate(
        { ...values },
        key,
        value,
        additional?.markPrice ?? 0,
        options.symbolInfo
      );

      // orderEntryActions.updateOrder(key, newValues[key as keyof OrderEntity]);
      console.log("@orderEntryActions.updateOrder", newValues);
      orderEntryActions.updateOrder(newValues);

      // validate the order
    },
    [calculate, options.symbolInfo, orderEntryActions]
  );

  const setValues = useCallback(
    (
      values: Partial<FullOrderState>,
      additional?: {
        markPrice: number;
      }
    ) => {
      if (!options.symbolInfo) {
        orderEntryActions.updateOrder(values);
        console.warn("[ORDERLY]:symbolInfo is required to calculate the order");
        return;
      }

      const prevValues = useOrderStore.getState().entry;
      let newValues = { ...prevValues };

      Object.keys(values).forEach((key) => {
        newValues = calculate(
          newValues,
          key as keyof FullOrderState,
          values[key as keyof FullOrderState],
          additional?.markPrice ?? 0,
          options.symbolInfo!
        );

        // orderEntryActions.updateOrder(newValues);
      });

      orderEntryActions.updateOrder(newValues);
    },
    []
  );

  const onMarkPriceChange = useCallback((markPrice: number) => {
    // console.log("markPrice", markPrice);
    if (!options.symbolInfo) return;
    const values = useOrderStore.getState().entry;
    const newValues = calculate(
      { ...values },
      "price",
      markPrice,
      markPrice,
      options.symbolInfo
    );

    orderEntryActions.updateOrder(newValues);
  }, []);

  return {
    formattedOrder: orderEntity,
    setValue,
    setValues,
    onMarkPriceChange,
  } as const;
};

export { useOrderEntryNextInternal };
