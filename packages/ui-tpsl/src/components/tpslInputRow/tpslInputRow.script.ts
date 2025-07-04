import { useState } from "react";
import { OrderType } from "@orderly.network/types";

export type Props = {
  type: "tp" | "sl";
  quote_dp: number;
  values: {
    enable: boolean;
    trigger_price: string;
    PnL: string;
    Offset: string;
    "Offset%": string;
    ROI: string;
    order_price: string;
    order_type: OrderType;
  };
  onChange: (key: string, value: string | boolean) => void;
};
export const useTPSLInputRowScript = (props: Props) => {
  return {
    values: props.values,
    onChange: props.onChange,
    type: props.type,
    quote_dp: props.quote_dp,
  };
};
