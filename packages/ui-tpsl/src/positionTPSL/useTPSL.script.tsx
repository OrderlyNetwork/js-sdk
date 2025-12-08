import { useEffect, useMemo, useRef } from "react";
import {
  type ComputedAlgoOrder,
  ERROR_MSG_CODES,
  useEstLiqPriceBySymbol,
  useLocalStorage,
  useMemoizedFn,
  usePositionStream,
  useSymbolsInfo,
  useTPSLOrder,
  useTpslPriceChecker,
  utils,
} from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import {
  AlgoOrderRootType,
  AlgoOrderType,
  API,
  OrderType,
  PositionType,
  SDKError,
} from "@veltodefi/types";
import { modal, toast } from "@veltodefi/ui";
import { PositionTPSLConfirm } from "./positionTpslConfirm";

type PropsWithTriggerPrice = {
  withTriggerPrice?: boolean;
  triggerPrice?: number;
  type?: "tp" | "sl";
  qty?: number;
};

export type TPSLBuilderOptions = {
  symbol: string;
  position?: API.Position;
  order?: API.AlgoOrder;
  onTPSLTypeChange?: (type: AlgoOrderRootType) => void;
  isEditing?: boolean;
  positionType?: PositionType;
  /**
   * either show the confirm dialog or not,
   * if the Promise reject or return false, cancel the submit action
   */
  onConfirm?: (
    order: ComputedAlgoOrder,
    options: {
      position: API.Position;
      submit: (params?: { accountId?: string }) => Promise<any>;
      cancel: () => Promise<any>;
    },
  ) => Promise<boolean>;
  close?: () => void;
};

export const useTPSLBuilder = (
  options: TPSLBuilderOptions & PropsWithTriggerPrice,
) => {
  const {
    symbol,
    order,
    isEditing,
    positionType,
    triggerPrice,
    type,
    withTriggerPrice,
  } = options;
  const { t } = useTranslation();
  // const isEditing = !!order;
  if (isEditing && !order) {
    throw new SDKError("order is required when isEditing is true");
  }
  // const symbol = isEditing ? order!.symbol : position.symbol;
  const symbolInfo = useSymbolsInfo();

  const prevTPSLType = useRef<AlgoOrderRootType>(AlgoOrderRootType.TP_SL);
  const [{ rows: positions }] = usePositionStream();

  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);
  const position = positions.find((item) => item.symbol === symbol);

  const estLiqPrice = useEstLiqPriceBySymbol(symbol);

  useEffect(() => {
    if (!position) {
      options.close?.();
    }
  }, [position]);

  const [
    tpslOrder,
    {
      submit,
      deleteOrder,
      setValue,
      setValues,
      validate,
      metaState,
      errors,
      isCreateMutating,
      isUpdateMutating,
    },
  ] = useTPSLOrder(
    {
      symbol,
      position_qty: position?.position_qty ?? 0,
      average_open_price: position?.average_open_price ?? 0,
    },
    {
      defaultOrder: order,
      positionType: triggerPrice ? PositionType.PARTIAL : positionType,
      // tpslEnable: {
      //   tp_enable: !withTriggerPrice ? true : type === "tp",
      //   sl_enable: !withTriggerPrice ? true : type === "sl",
      // },
      isEditing,
    },
  );

  const slPriceError = useTpslPriceChecker({
    slPrice: tpslOrder.sl_trigger_price?.toString() ?? undefined,
    liqPrice: estLiqPrice ?? null,
    side: tpslOrder.side,
  });

  const isSlPriceWarning =
    slPriceError?.sl_trigger_price?.type === ERROR_MSG_CODES.SL_PRICE_WARNING;

  const setQuantity = (value: number | string) => {
    setValue("quantity", value);
  };

  const setOrderPrice = (
    name: "tp_trigger_price" | "sl_trigger_price",
    value: number | string,
  ) => {
    setValue(name, value);
  };

  const setPnL = (type: string, value: number | string) => {
    setValue(type, value);
  };

  const maxQty = useMemo(
    () => Math.abs(Number(position?.position_qty)),
    [position?.position_qty],
  );

  const dirty = useMemo(() => {
    const quantity =
      order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
        ? maxQty
        : order?.quantity;

    let diff: number = 0;

    if (Number(tpslOrder.quantity) !== quantity) {
      diff = 1;
    } else if (!isEditing && !!tpslOrder.quantity) {
      diff = 1;
    }

    if (order && isEditing) {
      const { tp_trigger_price, sl_trigger_price } =
        utils.findTPSLFromOrder(order);
      const { tp_order_price, sl_order_price } =
        utils.findTPSLOrderPriceFromOrder(order);

      if (
        tp_trigger_price !== Number(tpslOrder.tp_trigger_price) &&
        typeof typeof tpslOrder.tp_trigger_price !== "undefined"
      ) {
        diff = 2;
      }

      if (
        sl_trigger_price !== Number(tpslOrder.sl_trigger_price) &&
        typeof tpslOrder.sl_trigger_price !== "undefined"
      ) {
        diff = 3;
      }
      if (
        typeof tpslOrder.tp_order_price !== "undefined" &&
        tp_order_price !== OrderType.MARKET &&
        tp_order_price !== Number(tpslOrder.tp_order_price)
      ) {
        diff = 4;
      }
      if (
        typeof tpslOrder.sl_order_price !== "undefined" &&
        sl_order_price !== OrderType.MARKET &&
        sl_order_price !== Number(tpslOrder.sl_order_price)
      ) {
        diff = 5;
      }
    }

    if (
      diff === 1 &&
      !tpslOrder.tp_trigger_price &&
      !tpslOrder.sl_trigger_price
    ) {
      diff = -1;
    }

    return diff;
  }, [
    tpslOrder.tp_trigger_price,
    tpslOrder.tp_order_price,
    tpslOrder.sl_trigger_price,
    tpslOrder.sl_order_price,
    tpslOrder.quantity,
    order,
    isEditing,
  ]);

  useEffect(() => {
    if (!withTriggerPrice) {
      return;
    }
    if (!triggerPrice) {
      return;
    }
    if (type === "tp") {
      setValue("tp_trigger_price", triggerPrice);
    } else {
      setValue("sl_trigger_price", triggerPrice);
    }
    if (options.qty) {
      setValue("quantity", options.qty);
    }
  }, [type, triggerPrice, options.qty]);

  const cancel = (): Promise<void> => {
    if (order?.algo_order_id && order?.symbol) {
      return deleteOrder(order?.algo_order_id, order?.symbol);
    }
    return Promise.reject("order id or symbol is invalid");
  };

  const onConfirm = (
    order: ComputedAlgoOrder,
    options: {
      position: API.Position;
      submit: (params?: { accountId?: string }) => Promise<any>;
      cancel: () => Promise<any>;
    },
  ) => {
    if (!needConfirm) {
      return Promise.resolve(true);
    }

    const maxQty = Math.abs(Number(position?.position_qty));
    if (
      `${order.tp_trigger_price ?? ""}`.length === 0 &&
      `${order.sl_trigger_price ?? ""}`.length === 0
    ) {
      return modal
        .confirm({
          title: t("orders.cancelOrder"),
          content: t("tpsl.cancelOrder.description"),
          onOk: () => {
            return options.cancel();
          },
        })
        .then(
          () => {
            return true;
          },
          () => {
            return Promise.reject(false);
          },
        );
    }

    return modal
      .confirm({
        title: t("tpsl.confirmOrder"),
        // bodyClassName: "lg:oui-py-0",
        onOk: async () => {
          try {
            const res = await options.submit({
              accountId: position?.account_id,
            });

            if (res.success) {
              return res;
            }

            if (res.message) {
              toast.error(res.message);
            }

            return false;
          } catch (err: any) {
            if (err?.message) {
              toast.error(err.message);
            }
            return false;
          }
        },
        classNames: {
          body: "!oui-pb-0",
        },
        content: (
          <PositionTPSLConfirm
            isPositionTPSL={positionType === PositionType.FULL}
            isEditing={isEditing}
            symbol={order.symbol!}
            qty={Number(order.quantity)}
            maxQty={maxQty}
            tpPrice={Number(order.tp_trigger_price)}
            slPrice={Number(order.sl_trigger_price)}
            side={order.side!}
            orderInfo={order}
            quoteDP={symbolInfo[symbol]("quote_dp") ?? 2}
            baseDP={symbolInfo[symbol]("base_dp") ?? 2}
          />
        ),
      })
      .then(
        () => {
          return true;
        },
        () => {
          return Promise.reject(false);
        },
      );
  };

  const onSubmit = async () => {
    try {
      const validOrder = await validate(
        isSlPriceWarning ? undefined : (slPriceError as any),
      );
      if (validOrder) {
        if (!needConfirm) {
          return submit({ accountId: position?.account_id })
            .then(() => true)
            .catch((err) => {
              if (err?.message) {
                toast.error(err.message);
              }
              throw false;
            });
        }

        return onConfirm(tpslOrder, {
          position: position!,
          submit,
          cancel,
        });
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return {
    isEditing,
    symbolInfo: symbolInfo[symbol],
    maxQty,
    setQuantity: useMemoizedFn(setQuantity),
    orderQuantity: tpslOrder.quantity,
    // isPosition: isPositionTPSL,

    TPSL_OrderEntity: tpslOrder,
    setOrderValue: setValue,
    setPnL,
    setOrderPrice,
    // needConfirm,
    onSubmit,
    slPriceError,
    estLiqPrice,
    metaState,
    errors,
    status: {
      isCreateMutating,
      isUpdateMutating,
    },
    position,
    setValues,
  } as const;
};

export type TPSLBuilderState = ReturnType<typeof useTPSLBuilder>;
