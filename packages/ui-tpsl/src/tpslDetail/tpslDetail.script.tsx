import { useEffect, useState } from "react";
import {
  findPositionTPSLFromOrders,
  useAccount,
  useEventEmitter,
  useOrderStream,
  useSubAccountAlgoOrderStream,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import {
  AlgoOrderRootType,
  API,
  OrderStatus,
  PositionType,
} from "@orderly.network/types";
import { modal, useScreen } from "@orderly.network/ui";
import { TPSLDialogId, TPSLSheetId } from "../positionTPSL/tpsl.widget";
import { TPSLDetailProps } from "./tpslDetail.widget";

export const useTPSLDetail = (props: TPSLDetailProps) => {
  const { position } = props;

  const symbol = position.symbol;
  const symbolInfo = useSymbolsInfo()[symbol];

  const ee = useEventEmitter();

  const { state } = useAccount();

  const { isMobile } = useScreen();
  const [fullPositionOrders, setFullPositionOrders] = useState<API.AlgoOrder[]>(
    [],
  );
  const [partialPositionOrders, setPartialPositionOrders] = useState<
    API.AlgoOrder[]
  >([]);

  const isSubAccount =
    position.account_id && position.account_id !== state.mainAccountId;

  const [
    mainAccountTpslOrders,
    { cancelAlgoOrder, cancelPostionOrdersByTypes },
  ] = useOrderStream(
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

  const [
    subAccountTpslOrders,
    {
      cancelAlgoOrder: cancelSubAccountAlgoOrder,
      cancelPostionOrdersByTypes: cancelSubAccountPostionOrdersByTypes,
      refresh: refreshSubAccountTpslOrders,
    },
  ] = useSubAccountAlgoOrderStream(
    {
      symbol: position.symbol,
      status: OrderStatus.INCOMPLETE,
      includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
      size: 100,
    },
    {
      accountId: position.account_id!,
    },
  );

  const tpslOrders = isSubAccount
    ? subAccountTpslOrders
    : mainAccountTpslOrders;

  const onCancelOrder = async (order: API.AlgoOrder) => {
    if (isSubAccount) {
      const res = await cancelSubAccountAlgoOrder(
        order.algo_order_id,
        order.symbol,
      );
      refreshSubAccountTpslOrders();
      ee.emit("tpsl:updateOrder", position);
      return res;
    }
    return await cancelAlgoOrder(order.algo_order_id, order.symbol);
  };

  const onCancelAllTPSLOrders = async () => {
    if (isSubAccount) {
      const res = await cancelSubAccountPostionOrdersByTypes(symbol, [
        AlgoOrderRootType.TP_SL,
      ]);
      refreshSubAccountTpslOrders();
      ee.emit("tpsl:updateOrder", position);
      return res;
    }
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
      position,
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
