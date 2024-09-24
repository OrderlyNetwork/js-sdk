import { create } from "zustand";
import {
  type API,
  BracketOrderEntry,
  OrderEntity,
  OrderlyOrder,
  OrderSide,
  OrderType,
  SDKError,
} from "@orderly.network/types";

import { useCallback, useEffect } from "react";
import {
  baseInputHandle,
  getCalculateHandler,
} from "../../utils/orderEntryHelper";
import { compose, head } from "ramda";
import { tpslCalculateHelper } from "../../orderly/useTakeProfitAndStopLoss/tp_slUtils";
import { OrderFactory } from "../../services/orderCreator/factory";
import {
  type FullOrderState,
  useOrderEntryFromStore,
  useOrderStore,
} from "./orderEntry.store";
import { useMutation } from "../../useMutation";

const useOrderEntryNextInternal = (
  symbol: string,
  options: {
    /**
     * initial order state, default is buy limit order
     *
     */
    initialOrder?: Omit<Partial<FullOrderState>, "symbol">;
    symbolInfo?: API.SymbolExt;
  } = {}
) => {
  const orderEntity = useOrderEntryFromStore();

  const {
    // markPrice,
    initialOrder = {
      side: OrderSide.BUY,
      type: OrderType.LIMIT,
    },
    symbolInfo,
  } = options;

  const orderEntryActions = useOrderStore((state) => state.actions);

  const isAlgoOrder =
    orderEntity?.type === OrderType.STOP_LIMIT ||
    orderEntity?.type === OrderType.STOP_MARKET ||
    orderEntity?.type === OrderType.CLOSE_POSITION;

  const [doCreateOrder, { isMutating }] = useMutation<OrderEntity, any>(
    isAlgoOrder ? "/v1/algo/order" : "/v1/order"
  );

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

      // if fieldName is type,recalculate

      //whether tpsl calculation is necessary

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

  const setValue = useCallback(
    (
      key: keyof FullOrderState,
      value: any,
      additional?: {
        markPrice: number;
      }
    ) => {
      console.group("setValue");
      console.log("key", key);
      console.log("value", value);
      console.log("additional", additional);
      console.log("symbolInfo", symbolInfo);
      console.groupEnd();

      if (!symbolInfo) {
        orderEntryActions.updateOrderByKey(key, value);
        console.warn("[ORDERLY]:symbolInfo is required to calculate the order");
        return;
      }

      const values = useOrderStore.getState().entry;
      const { markPrice } = additional ?? { markPrice: 0 };

      let newValues = calculate(
        { ...values },
        key,
        value,
        markPrice,
        symbolInfo
      );

      /// if the order type is market or stop market, recalculate the total use mark price
      if (
        key === "type" &&
        (value === OrderType.MARKET || value === OrderType.STOP_MARKET)
      ) {
        newValues = calculate(
          newValues,
          "price",
          markPrice,
          markPrice,
          symbolInfo
        );
      }
      // orderEntryActions.updateOrder(key, newValues[key as keyof OrderEntity]);

      orderEntryActions.updateOrder(newValues);

      // validate the order
    },
    [calculate, symbolInfo, orderEntryActions]
  );

  const setValues = useCallback(
    (
      values: Partial<FullOrderState>,
      additional?: {
        markPrice: number;
      }
    ) => {
      if (!symbolInfo) {
        orderEntryActions.updateOrder(values);
        console.warn("[ORDERLY]:symbolInfo is required to calculate the order");
        return;
      }

      const prevValues = useOrderStore.getState().entry;
      let newValues: Partial<FullOrderState> = { ...prevValues };

      Object.keys(values).forEach((key) => {
        newValues = calculate(
          newValues,
          key as keyof FullOrderState,
          values[key as keyof FullOrderState],
          additional?.markPrice ?? 0,
          symbolInfo!
        );

        // orderEntryActions.updateOrder(newValues);
      });

      orderEntryActions.updateOrder(newValues);
    },
    [calculate, orderEntryActions, symbolInfo]
  );

  const onMarkPriceUpdated = useCallback((markPrice: number) => {
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

  const createOrder = () => {
    if (!orderEntity.symbol) {
      throw new SDKError("symbol is error");
    }

    if (!orderEntity.side) {
      throw new SDKError("side is error");
    }

    if (!orderEntity || typeof orderEntity.type === "undefined") {
      throw new SDKError("order_type is error");
    }

    const orderCreator = OrderFactory.create(orderEntity.type);

    // return orderCreator.validate(orderEntity, {
    //   symbol: symbolInfo!,
    //   maxQty,
    //   markPrice: markPrice,
    // });
  };

  const validate = useCallback(
    (options: { maxQty: number; markPrice: number }) => {
      const { markPrice, maxQty } = options;
      const creator = OrderFactory.create(orderEntity.type);

      return creator?.validate(orderEntity, {
        symbol: symbolInfo!,
        // token: tokenInfo[symbol](),
        maxQty,
        markPrice,
      });
    },
    [orderEntity, symbolInfo]
  );

  const submitOrder = useCallback(() => {
    console.log("submitOrder orderEntity:", orderEntity);
    // const order = OrderFactory.create(values.type);
    // order.submit(values);
  }, [orderEntity]);

  return {
    formattedOrder: orderEntity,
    setValue,
    setValues,
    submit: submitOrder,
    validate,
    onMarkPriceChange: onMarkPriceUpdated,
  } as const;
};

export { useOrderEntryNextInternal };
