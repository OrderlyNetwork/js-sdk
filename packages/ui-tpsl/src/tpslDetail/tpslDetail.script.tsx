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
import { modal, toast, useScreen } from "@orderly.network/ui";
import { TPSLDialogId, TPSLSheetId } from "../positionTPSL/tpsl.widget";
import { TPSLDetailProps } from "./tpslDetail.widget";

export const useTPSLDetail = (props: TPSLDetailProps) => {
  const { position } = props;
  const symbol = position.symbol;
  const symbolInfo = useSymbolsInfo()[symbol];

  const { isMobile } = useScreen();
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
    const dialogId = isMobile ? TPSLSheetId : TPSLDialogId;
    modal.show(dialogId, {
      order: order,
      symbol: position.symbol,
      positionType,
      isEditing,
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
