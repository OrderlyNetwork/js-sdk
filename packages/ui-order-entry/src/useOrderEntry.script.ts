import { positionActions, useMarkPriceBySymbol } from "@orderly.network/hooks";
import { OrderSide, OrderType } from "@orderly.network/types";
import { useState } from "react";
import { useOrderEntryNext } from "@orderly.network/hooks";

export const useOrderEntryScript = () => {
  // const markPrice = useMarkPriceBySymbol("PERP_BTC_USDC");
  // const { getPositions } = positionActions();
  const { formattedOrder, setValue } = useOrderEntryNext("PERP_BTC_USDC", {});

  return {
    // markPrice,
    side: formattedOrder.side as OrderSide,
    type: formattedOrder.type as OrderType,
    setOrderValue: setValue,
    orderEntity: formattedOrder,
  };
};

export type uesOrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;
