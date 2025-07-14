import { useEffect, useState } from "react";
import {
  findPositionTPSLFromOrders,
  findTPSLFromOrder,
  useOrderStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import {
  AlgoOrder,
  AlgoOrderRootType,
  API,
  OrderStatus,
  PositionType,
} from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { TPSLDialogId } from "../tpsl.widget";
import { TPSLDetailProps } from "./tpslDetail.widget";

export const useTPSLDetail = (props: TPSLDetailProps) => {
  const { position } = props;
  const symbol = position.symbol;
  const symbolInfo = useSymbolsInfo();
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

  const editTPSLOrder = async (
    order: API.AlgoOrder,
    positionType: PositionType,
  ) => {
    modal.show(TPSLDialogId, {
      positionType: positionType,
      position: position,
      order: order,
      isEditing: true,
      onComplete: () => {
        refresh();
      },
    });
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
    symbolInfo: symbolInfo[symbol],
    position,
    symbol,
    fullPositionOrders,
    partialPositionOrders,
    cancelPostionOrdersByTypes,
    onCancelOrder,
    onCancelAllTPSLOrders,
    editTPSLOrder,
  };
};

export type TPSLDetailState = ReturnType<typeof useTPSLDetail>;
