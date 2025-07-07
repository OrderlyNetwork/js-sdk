import { OrderValidationResult } from "@orderly.network/hooks";
import { OrderType, PositionType } from "@orderly.network/types";

export type Props = {
  type: "tp" | "sl";
  quote_dp: number;
  positionType: PositionType;
  errors: OrderValidationResult | null;
  values: {
    enable: boolean;
    trigger_price: string;
    PnL: string;
    Offset: string;
    "Offset%": string;
    ROI?: string;
    order_price: string;
    order_type: OrderType;
  };
  onChange: (key: string, value: string | boolean | number) => void;
};
export const useTPSLInputRowScript = (props: Props) => {
  return {
    values: props.values,
    onChange: props.onChange,
    type: props.type,
    quote_dp: props.quote_dp,
    positionType: props.positionType,
    errors: props.errors,
  };
};
