import { useState } from "react";
import { OrderType } from "@orderly.network/types";

export type Props = {
  type: "tp" | "sl";
  values: {
    trigger_price: string;
    PnL: string;
    Offset: string;
    "Offset%": string;
    ROI: string;
    order_price: string;
  };
  onChange: (key: string, value: string) => void;
};
export const useTPSLInputRowScript = (props: Props) => {
  const [priceType, setPriceType] = useState<OrderType>(OrderType.MARKET);

  return {
    values: props.values,
    onChange: props.onChange,
    type: props.type,
    priceType,
    setPriceType,
  };
};
