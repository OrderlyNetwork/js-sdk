import { useEffect, useState } from "react";
import { omit } from "ramda";
import {
  API,
  AlgoOrderEntity,
  OrderSide,
  OrderType,
  OrderlyOrder,
  PositionType,
  SDKError,
} from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";
import { AlgoOrderType } from "@orderly.network/types";
import { OrderFactory } from "../../services/orderCreator/factory";
import { OrderValidationItem } from "../../services/orderCreator/interface";
import { TPSLPositionOrderCreator } from "../../services/orderCreator/tpslPositionOrderCreator";
import { useSubAccountMutation } from "../../subAccount";
import { useMutation } from "../../useMutation";
import { useMarkPrice } from "../useMarkPrice";
import {
  findTPSLFromOrder,
  findTPSLOrderPriceFromOrder,
} from "../usePositionStream/utils";
import { useSymbolsInfo } from "../useSymbolsInfo";
import { UpdateOrderKey, tpslCalculateHelper } from "./tp_slUtils";

export type TPSLComputedData = {
  /**
   * Computed take profit
   */
  tp_pnl: number;
  tp_offset: number;
  tp_offset_percentage: number;

  /**
   * Computed stop loss
   */
  sl_pnl: number;
  sl_offset: number;
  sl_offset_percentage: number;
};

export type ComputedAlgoOrder = Partial<
  AlgoOrderEntity<AlgoOrderRootType.TP_SL> & TPSLComputedData
>;

export type ValidateError = {
  [P in keyof ComputedAlgoOrder]?: OrderValidationItem;
};

const checkIsEnableTpSL = (
  order?: API.AlgoOrder,
): {
  tp_enable: boolean;
  sl_enable: boolean;
} => {
  const result = {
    tp_enable: true,
    sl_enable: true,
  };
  if (!order) {
    return result;
  }
  const tp = order.child_orders.find(
    (o) => o.algo_type === AlgoOrderType.TAKE_PROFIT && o.is_activated,
  );
  const sl = order.child_orders.find(
    (o) => o.algo_type === AlgoOrderType.STOP_LOSS && o.is_activated,
  );

  if (!tp) {
    result.tp_enable = false;
  }
  if (!sl) {
    result.sl_enable = false;
  }
  return result;
};

/**
 * @hidden
 */
export const useTaskProfitAndStopLossInternal = (
  position: Partial<API.PositionTPSLExt> &
    Pick<API.PositionTPSLExt, "symbol" | "average_open_price" | "position_qty">,
  options?: {
    defaultOrder?: API.AlgoOrder;
    /**
     * If the order is editing, set to true
     * if the isEditing is true, the defaultOrder must be provided
     * Conversely, even if defaultOrder is provided and isEditing is false, a new TPSL order is still created
     */
    isEditing?: boolean;
    tpslEnable?: {
      tp_enable?: boolean;
      sl_enable?: boolean;
    };
    positionType?: PositionType;
  },
): [
  /**
   * return the computed & formatted order
   */
  ComputedAlgoOrder,
  {
    /**
     * Update the take profit and stop loss order, this will merge the new data with the old one
     */
    setValue: (key: string, value: number | string | boolean) => void;
    setValues: (values: Partial<ComputedAlgoOrder>) => void;
    // getOrderEntity: () => AlgoOrderEntity<AlgoOrderRootType.TP_SL|AlgoOrderRootType.POSITIONAL_TP_SL>;
    /**
     * Submit the TP/SL order
     */
    submit: (params?: { accountId?: string }) => Promise<any>;
    deleteOrder: (orderId: number, symbol: string) => Promise<any>;
    // /**
    //  * Create the take profit and stop loss order, auto-detect the order type
    //  */
    // create: () => Promise<void>;
    // update: (orderId: number) => Promise<any>;
    errors: ValidateError | null;
    /**
     *
     */
    validate: () => Promise<
      AlgoOrderEntity<
        AlgoOrderRootType.POSITIONAL_TP_SL | AlgoOrderRootType.TP_SL
      >
    >;
    isCreateMutating: boolean;
    isUpdateMutating: boolean;
  },
] => {
  const isEditing =
    typeof options?.isEditing !== "undefined"
      ? options!.isEditing
      : !!options?.defaultOrder;

  const [order, setOrder] = useState<
    ComputedAlgoOrder & {
      ignoreValidate?: boolean;
    }
  >({
    algo_order_id: options?.defaultOrder?.algo_order_id,
    symbol: position.symbol as string,
    side: Number(position.position_qty) > 0 ? OrderSide.BUY : OrderSide.SELL,
    quantity: isEditing
      ? options?.defaultOrder?.quantity === 0
        ? Math.abs(position.position_qty)
        : options?.defaultOrder?.quantity
      : options?.positionType === PositionType.FULL
        ? Math.abs(position.position_qty)
        : 0,
    // quantity:
    //   options?.positionType === PositionType.PARTIAL
    //     ? 0
    //     : Math.abs(position.position_qty),
    // quantity:
    //   options?.defaultOrder?.quantity || Math.abs(position.position_qty),
    algo_type: options?.defaultOrder?.algo_type as AlgoOrderRootType,
    tp_enable: isEditing
      ? checkIsEnableTpSL(options?.defaultOrder).tp_enable
      : options?.tpslEnable?.tp_enable,
    sl_enable: isEditing
      ? checkIsEnableTpSL(options?.defaultOrder).sl_enable
      : options?.tpslEnable?.sl_enable,
    position_type: options?.positionType,
  });

  const symbolInfo = useSymbolsInfo()[position.symbol!]();
  const { data: markPrice } = useMarkPrice(order.symbol!);

  const [doCreateOrder, { isMutating: isCreateMutating }] =
    useSubAccountMutation("/v1/algo/order");
  const [doUpdateOrder, { isMutating: isUpdateMutating }] =
    useSubAccountMutation("/v1/algo/order", "PUT");
  const [doDeleteOrder] = useMutation("/v1/algo/order", "DELETE");

  const [errors, setErrors] = useState<ValidateError | null>(null);

  useEffect(() => {
    if (!isEditing || !options?.defaultOrder) return;
    const trigger_prices = findTPSLFromOrder(options.defaultOrder!);
    const order: ComputedAlgoOrder = {};
    if (trigger_prices.tp_trigger_price) {
      order.tp_trigger_price = trigger_prices.tp_trigger_price;
    }
    if (trigger_prices.sl_trigger_price) {
      order.sl_trigger_price = trigger_prices.sl_trigger_price;
    }
    const order_prices = findTPSLOrderPriceFromOrder(options.defaultOrder!);
    if (
      order_prices.tp_order_price &&
      order_prices.tp_order_price !== OrderType.MARKET
    ) {
      order.tp_order_type = OrderType.LIMIT;
      order.tp_order_price = order_prices.tp_order_price;
    }
    if (
      order_prices.sl_order_price &&
      order_prices.sl_order_price !== OrderType.MARKET
    ) {
      order.sl_order_type = OrderType.LIMIT;
      order.sl_order_price = order_prices.sl_order_price;
    }
    setValues(order);
  }, []);

  const _setOrderValue = (
    key: string,
    value: number | string | boolean,
    options?: {
      ignoreValidate?: boolean;
    },
  ) => {
    // console.log("[updateOrder:]", key, value);

    setOrder((prev) => {
      const side = position.position_qty! > 0 ? OrderSide.BUY : OrderSide.SELL;

      // if (key === "sl_pnl") {
      //   value = value ? `-${value}` : "";
      // }

      console.log("setorder value", {
        key,
        value,
        entryPrice: position.average_open_price!,
        qty:
          side === OrderSide.BUY
            ? Number(prev.quantity)!
            : -Number(prev.quantity)!,
        orderSide: side,
        values: prev as Partial<OrderlyOrder>,
      });
      const newValue = tpslCalculateHelper(
        key,
        {
          key,
          value,
          entryPrice: position.average_open_price!,
          qty:
            side === OrderSide.BUY
              ? Number(prev.quantity)!
              : -Number(prev.quantity)!,
          orderSide: side,
          values: prev as Partial<OrderlyOrder>,
        },
        {
          symbol: symbolInfo,
        },
      );

      return {
        ...prev,
        ...newValue,
        ignoreValidate: options?.ignoreValidate,
      };
    });
  };

  const setOrderValue = async (
    key: string,
    value: number | string | boolean,
    options?: {
      ignoreValidate?: boolean;
    },
  ) => {
    // console.log("-------->>>>>", key, value);
    if (key === "quantity") {
      setOrder((prev) => ({ ...prev, quantity: value as string }));

      if (typeof order.sl_trigger_price !== "undefined") {
        _setOrderValue("sl_trigger_price", order.sl_trigger_price, {
          ignoreValidate: true,
        });
      }
      if (typeof order.sl_order_price !== "undefined") {
        _setOrderValue("sl_order_price", order.sl_order_price, {
          ignoreValidate: true,
        });
      }

      if (typeof order.tp_trigger_price !== "undefined") {
        _setOrderValue("tp_trigger_price", order.tp_trigger_price, {
          ignoreValidate: true,
        });
      }
      if (typeof order.tp_order_price !== "undefined") {
        _setOrderValue("tp_order_price", order.tp_order_price, {
          ignoreValidate: true,
        });
      }

      // TODO: need to optimizations code
      _setOrderValue(key, value, options);

      return;
    }

    _setOrderValue(key, value, options);
  };

  /**
   * calculate value config
   */
  const valueConfig = {
    symbol: symbolInfo,
    maxQty: Math.abs(position.position_qty),
    markPrice,
  };

  // auto validate when order changed
  useEffect(() => {
    requestAnimationFrame(() => {
      if (order.ignoreValidate) return;
      if (!order.quantity) {
        return;
      }
      const orderCreator = getOrderCreator();
      orderCreator
        .validate(order as AlgoOrderEntity, valueConfig)
        .then((errors) => {
          setErrors(errors);
        });
    });
  }, [order, valueConfig.markPrice, order.quantity]);

  const setValues = (values: Partial<ComputedAlgoOrder>) => {
    const keys = Object.keys(values);
    keys.forEach((key) => {
      setOrderValue(
        key as UpdateOrderKey,
        values[key as keyof ComputedAlgoOrder] as number | string,
      );
    });
  };

  const validate = (): Promise<
    AlgoOrderEntity<
      AlgoOrderRootType.POSITIONAL_TP_SL | AlgoOrderRootType.TP_SL
    >
  > => {
    const orderCreator = getOrderCreator();

    return new Promise((resolve, reject) => {
      return orderCreator
        .validate(
          order as AlgoOrderEntity<AlgoOrderRootType.TP_SL>,
          valueConfig,
        )
        .then((errors) => {
          console.log("errors::", errors);

          if (errors) {
            setErrors(errors);
            return reject(errors);
          }

          resolve(
            orderCreator.create(
              order as AlgoOrderEntity<AlgoOrderRootType.TP_SL>,
              valueConfig,
            ),
          );
        });
    });
  };

  // useEffect(() => {
  //   // setError(validate());
  // }, [order]);

  const compare = (): boolean => {
    const quantityNum = Number(order.quantity);
    if (isNaN(quantityNum)) return false;
    return quantityNum === Math.abs(Number(position.position_qty));
  };

  const getOrderCreator = () => {
    // if the order is existed, and the order type is POSITIONAL_TP_SL, always return POSITIONAL_TP_SL
    // else use qty to determine the order type
    if (options?.defaultOrder?.algo_type === AlgoOrderRootType.TP_SL) {
      return OrderFactory.create(AlgoOrderRootType.TP_SL);
    }
    return OrderFactory.create(
      compare() ? AlgoOrderRootType.POSITIONAL_TP_SL : AlgoOrderRootType.TP_SL,
    );
  };

  const submit = async (params?: {
    /**
     * if you are main account to create tpsl order, you need to provide the accountId
     */
    accountId?: string;
  }) => {
    const defaultOrder = options?.defaultOrder;
    const orderId = defaultOrder?.algo_order_id;
    const algoType = defaultOrder?.algo_type;

    // if algo_order_id is not existed, create new order
    if (!orderId) {
      return createOrder(params);
    }

    // if algo_order_id is existed and algoType = POSITION_TP_SL
    if (algoType === AlgoOrderRootType.POSITIONAL_TP_SL) {
      // if order.qty = position.qty, update order
      if (compare()) {
        return updateOrder(orderId!, params);
      }
      // if order.qty != position.qty, create new tp/sl order
      return createOrder(params);
    }

    // if algo_order_id is existed and algoType = TP_SL, delete order and create new order

    return updateOrder(orderId!, params);
  };

  const createOrder = (params?: { accountId?: string }) => {
    const orderCreator = getOrderCreator();

    const orderBody = orderCreator.create(
      order as AlgoOrderEntity<AlgoOrderRootType.TP_SL>,
      valueConfig,
    );

    if (orderBody.child_orders.length === 0) {
      throw new SDKError("No child orders");
    }

    // filter the order that is not activated
    orderBody.child_orders = orderBody.child_orders.filter(
      (order: API.AlgoOrderExt) => order.is_activated,
    );

    return doCreateOrder(orderBody, {}, params);
  };

  const deleteOrder = (orderId: number, symbol: string): Promise<any> => {
    return doDeleteOrder(null, {
      order_id: orderId,
      symbol,
    });
  };

  const updateOrder = (
    orderId: number,
    params?: { accountId?: string },
  ): Promise<any> => {
    const orderCreator =
      getOrderCreator() as unknown as TPSLPositionOrderCreator;

    const [updatedOrderEntity, orderEntity] = orderCreator.crateUpdateOrder(
      // @ts-ignore
      order,
      options?.defaultOrder,
      valueConfig,
    );

    if (updatedOrderEntity.child_orders.length === 0) {
      return Promise.resolve("Not any order needs to update");
    }

    const needDelete =
      orderEntity.child_orders.filter(
        (order) =>
          typeof order.is_activated === "boolean" && !order.is_activated,
      ).length === orderEntity.child_orders.length;

    if (needDelete) {
      return deleteOrder(orderId, order.symbol!);
    }

    return doUpdateOrder(
      {
        order_id: orderId,
        ...updatedOrderEntity,
      },
      {},
      params,
    );
  };

  return [
    omit(["ignoreValidate"], order) as ComputedAlgoOrder,
    {
      submit,
      deleteOrder,
      // create: submit,

      // update: updateOrder,/
      setValue: setOrderValue,
      setValues,
      // createPositionTPSL: submit,
      // createTPSL: submit,
      validate,
      errors,
      isCreateMutating,
      isUpdateMutating,
    },
  ];
};
