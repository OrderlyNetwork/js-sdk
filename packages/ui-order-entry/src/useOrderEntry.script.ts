import { useState } from "react";
import { OrderSide, OrderType } from "@orderly.network/types";
import { useOrderEntryNext } from "@orderly.network/hooks";

export type OrderEntryScriptInputs = {
  symbol: string;
};

export const useOrderEntryScript = (inputs: OrderEntryScriptInputs) => {
  const { formattedOrder, setValue, setValues, symbolInfo, ...actions } =
    useOrderEntryNext(inputs.symbol, {});

  // cancel TP/SL
  const cancelTP_SL = () => {
    // if(formattedOrder.)
    setValues({
      tp_trigger_price: "",
      sl_trigger_price: "",
    });
  };

  return {
    ...actions,
    side: formattedOrder.side as OrderSide,
    type: formattedOrder.type as OrderType,
    setOrderValue: setValue,

    orderEntity: formattedOrder,
    cancelTP_SL,
    symbolInfo,
  };
};

export type uesOrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;
