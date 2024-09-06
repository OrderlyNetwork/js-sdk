import { useState } from "react";
import { positionActions, useMarkPriceBySymbol } from "@orderly.network/hooks";
import { OrderSide, OrderType } from "@orderly.network/types";
import { useOrderEntryNext } from "@orderly.network/hooks";

export const useOrderEntryScript = () => {
  // const markPrice = useMarkPriceBySymbol("PERP_BTC_USDC");
  // const { getPositions } = positionActions();
  const { formattedOrder, setValue, setValues } = useOrderEntryNext(
    "PERP_BTC_USDC",
    {}
  );

  // cancel TP/SL
  const cancelTP_SL = () => {
    // if(formattedOrder.)
    setValues({
      tp_trigger_price: "",
      sl_trigger_price: "",
    });
  };

  return {
    // markPrice,
    side: formattedOrder.side as OrderSide,
    type: formattedOrder.type as OrderType,
    setOrderValue: setValue,
    orderEntity: formattedOrder,
    cancelTP_SL,
  };
};

export type uesOrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;
