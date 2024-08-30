import { positionActions, useMarkPriceBySymbol } from "@orderly.network/hooks";
import { OrderSide, OrderType } from "@orderly.network/types";
import { useState } from "react";

export const useOrderEntryScript = () => {
  const markPrice = useMarkPriceBySymbol("PERP_BTC_USDC");
  const { getPositions } = positionActions();
  const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.BUY);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.LIMIT);

  const { data } = getPositions();

  return {
    markPrice,
    side: orderSide,
    type: orderType,
    setOrderType,
    setOrderSide,
  };
};

export type uesOrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;
