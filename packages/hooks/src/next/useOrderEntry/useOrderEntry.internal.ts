import {
  type API,
  OrderEntity,
  OrderSide,
  OrderType,
} from "@orderly.network/types";

import { useCallback, useEffect } from "react";
import {
  baseInputHandle,
  getCalculateHandler,
} from "../../utils/orderEntryHelper";
import { compose, head } from "ramda";
import {
  type FullOrderState,
  useOrderEntryFromStore,
  useOrderStore,
} from "./orderEntry.store";
import { useMutation } from "../../useMutation";
import { OrderCreator } from "../../services/orderCreator/interface";
import { OrderlyOrder } from "@orderly.network/types";

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
      order_type: OrderType.LIMIT,
      order_price: "",
    },
    symbolInfo,
  } = options;

  const orderEntryActions = useOrderStore((state) => state.actions);

  const isAlgoOrder =
    orderEntity?.order_type === OrderType.STOP_LIMIT ||
    orderEntity?.order_type === OrderType.STOP_MARKET ||
    orderEntity?.order_type === OrderType.CLOSE_POSITION;

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

  const setValue = (
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

    let newValues = calculate({ ...values }, key, value, markPrice, symbolInfo);

    /// if the order type is market or stop market, recalculate the total use mark price
    if (
      key === "order_type" &&
      (value === OrderType.MARKET || value === OrderType.STOP_MARKET)
    ) {
      newValues = calculate(
        newValues,
        "order_price",
        markPrice,
        markPrice,
        symbolInfo
      );
    }

    orderEntryActions.updateOrder(newValues);

    return newValues;
  };

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

      return newValues;
    },
    [calculate, orderEntryActions, symbolInfo]
  );

  const onMarkPriceUpdated = useCallback((markPrice: number) => {
    // console.log("markPrice", markPrice);
    if (!options.symbolInfo) return;
    const values = useOrderStore.getState().entry;
    const newValues = calculate(
      { ...values },
      "order_price",
      markPrice,
      markPrice,
      options.symbolInfo
    );

    orderEntryActions.updateOrder(newValues);
  }, []);

  const validate = (
    order: Partial<OrderlyOrder>,
    creator: OrderCreator<any>,
    options: { maxQty: number; markPrice: number }
  ) => {
    const { markPrice, maxQty } = options;

    return creator?.validate(order, {
      symbol: symbolInfo!,
      maxQty,
      markPrice,
    });
  };

  const generateOrder = (
    creator: OrderCreator<any>,
    options: { maxQty: number; markPrice: number }
  ) => {
    const order = creator.create(orderEntity, {
      ...options,
      symbol: symbolInfo!,
    });

    return order;
  };

  const submitOrder = useCallback(() => {
    console.log("submitOrder orderEntity:", orderEntity);
    // const order = OrderFactory.create(values.type);
    // order.submit(values);
  }, [orderEntity]);

  // const hasErrors = useMemo(()=>{}, [errors]);

  return {
    formattedOrder: orderEntity,
    setValue,
    setValues,
    submit: submitOrder,
    generateOrder,
    validate,
    onMarkPriceChange: onMarkPriceUpdated,
  } as const;
};

export { useOrderEntryNextInternal };
