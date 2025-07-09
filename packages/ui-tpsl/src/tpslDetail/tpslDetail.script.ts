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
} from "@orderly.network/types";
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

  const [tpslOrders] = useOrderStream(
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
  };
};

export type TPSLDetailState = ReturnType<typeof useTPSLDetail>;
