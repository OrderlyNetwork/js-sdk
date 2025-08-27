import { useEffect, useMemo, useRef } from "react";
import {
  type ComputedAlgoOrder,
  useLocalStorage,
  usePositionStream,
  useSymbolsInfo,
  useTPSLOrder,
  utils,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  AlgoOrderRootType,
  API,
  OrderType,
  PositionType,
  SDKError,
} from "@orderly.network/types";
import { modal, toast } from "@orderly.network/ui";
import { PositionTPSLConfirm } from "../positionTpslConfirm";

export type TPSLBuilderOptions = {
  type: "tp" | "sl";
  triggerPrice?: number;
  symbol: string;
};

export const useTPSLSimpleDialog = (options: TPSLBuilderOptions) => {
  const { type, triggerPrice, symbol } = options;
  const symbolInfo = useSymbolsInfo();
  const [{ rows: positions }, positionsInfo] = usePositionStream(symbol);
  const position = positions?.[0];
  const prevTPSLType = useRef<AlgoOrderRootType>(AlgoOrderRootType.TP_SL);
  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);
  const { t } = useTranslation();

  const [
    tpslOrder,
    {
      submit,
      deleteOrder,
      setValue,
      setValues,
      validate,
      errors,
      isCreateMutating,
      isUpdateMutating,
    },
  ] = useTPSLOrder(
    {
      symbol: symbol!,
      position_qty: position?.position_qty,
      average_open_price: position?.average_open_price,
    },
    {
      defaultOrder: undefined,
      positionType: PositionType.PARTIAL,
      tpslEnable: { tp_enable: type === "tp", sl_enable: type === "sl" },
      isEditing: false,
    },
  );

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
    () => Math.abs(Number(position.position_qty)),
    [position.position_qty],
  );

  useEffect(() => {
    if (!maxQty) {
      return;
    }
    setValue("quantity", maxQty);
    if (type === "tp") {
      setValue("tp_trigger_price", triggerPrice ?? "");
    } else {
      setValue("sl_trigger_price", triggerPrice ?? "");
    }
  }, [type, triggerPrice, maxQty]);

  const onSubmit = async () => {
    try {
      const validOrder = await validate();
      if (validOrder) {
        if (!needConfirm) {
          return submit({ accountId: position.account_id })
            .then(() => true)
            .catch((err) => {
              if (err?.message) {
                toast.error(err.message);
              }
              throw false;
            });
        }
        // confirm
        return modal
          .confirm({
            title: t("tpsl.confirmOrder"),
            // bodyClassName: "lg:oui-py-0",
            onOk: async () => {
              try {
                const res = await submit({
                  accountId: position.account_id,
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
                isPositionTPSL={false}
                isEditing={false}
                symbol={symbol}
                qty={Number(tpslOrder.quantity)}
                maxQty={maxQty}
                tpPrice={Number(tpslOrder.tp_trigger_price)}
                slPrice={Number(tpslOrder.sl_trigger_price)}
                side={tpslOrder.side!}
                orderInfo={tpslOrder}
                quoteDP={symbolInfo[symbol]("quote_dp")}
                baseDP={symbolInfo[symbol]("base_dp")}
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
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return {
    symbolInfo: symbolInfo[symbol!],
    maxQty,
    setQuantity,
    orderQuantity: tpslOrder.quantity,
    isPosition: false,
    TPSL_OrderEntity: tpslOrder,
    setOrderValue: setValue,
    setPnL,
    setOrderPrice,
    onSubmit,
    errors,
    status: {
      isCreateMutating,
      isUpdateMutating,
    },
    position,
    setValues,
    type,
    triggerPrice,
  } as const;
};

export type TPSLBuilderState = ReturnType<typeof useTPSLSimpleDialog>;
