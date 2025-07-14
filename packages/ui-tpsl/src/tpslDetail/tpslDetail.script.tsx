import { useEffect, useState } from "react";
import {
  ComputedAlgoOrder,
  findPositionTPSLFromOrders,
  findTPSLFromOrder,
  useLocalStorage,
  useOrderStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  AlgoOrder,
  AlgoOrderRootType,
  API,
  OrderStatus,
  PositionType,
} from "@orderly.network/types";
import { modal, toast } from "@orderly.network/ui";
import { PositionTPSLConfirm } from "../tpsl.ui";
import { TPSLDialogId } from "../tpsl.widget";
import { TPSLDetailProps } from "./tpslDetail.widget";

export const useTPSLDetail = (props: TPSLDetailProps) => {
  const { position } = props;
  const symbol = position.symbol;
  const symbolInfo = useSymbolsInfo()[symbol];

  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);

  const { t } = useTranslation();
  const [fullPositionOrders, setFullPositionOrders] = useState<API.AlgoOrder[]>(
    [],
  );
  const [partialPositionOrders, setPartialPositionOrders] = useState<
    API.AlgoOrder[]
  >([]);

  const [tpslOrders, { cancelAlgoOrder, cancelPostionOrdersByTypes, refresh }] =
    useOrderStream(
      {
        symbol: position.symbol,
        status: OrderStatus.INCOMPLETE,
        includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
        size: 500,
      },
      {
        keeplive: true,
      },
    );

  const onCancelOrder = async (order: API.AlgoOrder) => {
    return await cancelAlgoOrder(order.algo_order_id, order.symbol);
  };
  const onCancelAllTPSLOrders = async () => {
    return await cancelPostionOrdersByTypes(symbol, [AlgoOrderRootType.TP_SL]);
  };

  const showTPSLDialog = ({
    order,
    positionType,
    isEditing,
  }: {
    order?: API.AlgoOrder;
    positionType: PositionType;
    isEditing: boolean;
  }) => {
    modal.show(TPSLDialogId, {
      order: order,
      position: position,
      positionType,
      isEditing,
      onConfirm: (order: ComputedAlgoOrder, options: any) => {
        if (!needConfirm) {
          return Promise.resolve(true);
        }

        const maxQty = Math.abs(Number(position.position_qty));
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

        const finalIsEditing =
          !!order &&
          order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
          order.quantity === maxQty;

        return modal
          .confirm({
            title: finalIsEditing
              ? t("orders.editOrder")
              : t("tpsl.confirmOrder"),
            // bodyClassName: "lg:oui-py-0",
            onOk: async () => {
              try {
                const res = await options.submit({
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
                isPositionTPSL={positionType === PositionType.FULL}
                isEditing={true}
                symbol={order.symbol!}
                qty={Number(order.quantity)}
                maxQty={maxQty}
                tpPrice={Number(order.tp_trigger_price)}
                slPrice={Number(order.sl_trigger_price)}
                side={order.side!}
                orderInfo={order}
                quoteDP={symbolInfo("quote_dp") ?? 2}
                baseDP={symbolInfo("base_dp") ?? 2}
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
      },
    });
  };

  const editTPSLOrder = (order: API.AlgoOrder, positionType: PositionType) => {
    showTPSLDialog({ order, positionType, isEditing: true });
  };

  const addTPSLOrder = (positionType: PositionType) => {
    showTPSLDialog({ positionType, isEditing: false });
  };

  useEffect(() => {
    if (tpslOrders) {
      const { fullPositionOrder, partialPositionOrders } =
        findPositionTPSLFromOrders(tpslOrders, symbol);

      setFullPositionOrders(fullPositionOrder ? [fullPositionOrder] : []);
      setPartialPositionOrders(partialPositionOrders ?? []);
    }
  }, [tpslOrders, symbol]);

  return {
    symbolInfo,
    position,
    symbol,
    fullPositionOrders,
    partialPositionOrders,
    cancelPostionOrdersByTypes,
    onCancelOrder,
    onCancelAllTPSLOrders,
    editTPSLOrder,
    addTPSLOrder,
  };
};

export type TPSLDetailState = ReturnType<typeof useTPSLDetail>;
