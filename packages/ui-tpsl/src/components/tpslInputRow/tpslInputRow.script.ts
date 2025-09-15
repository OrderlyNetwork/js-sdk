import { OrderValidationResult } from "@orderly.network/hooks";
import { OrderType, PositionType } from "@orderly.network/types";

export type Props = {
  disableOrderTypeSelector?: boolean;
  type: "tp" | "sl";
  quote_dp: number;
  positionType: PositionType;
  errors: OrderValidationResult | null;
  hideOrderPrice?: boolean;
  values: {
    enable: boolean;
    trigger_price: string | undefined;
    PnL: string | undefined;
    Offset: string | undefined;
    "Offset%": string | undefined;
    ROI?: string | undefined;
    order_price: string | undefined;
    order_type: OrderType;
  };
  onChange: (key: string, value: string | boolean | number) => void;
  rootOrderPrice: string | undefined;
  symbol: string;
  disableEnableCheckbox?: boolean;
  symbolLeverage?: number;
};
export const useTPSLInputRowScript = (props: Props) => {
  return {
    disableOrderTypeSelector: props.disableOrderTypeSelector,
    values: props.values,
    onChange: props.onChange,
    type: props.type,
    quote_dp: props.quote_dp,
    positionType: props.positionType,
    errors: props.errors,
    hideOrderPrice: props.hideOrderPrice,
    rootOrderPrice: props.rootOrderPrice,
    symbol: props.symbol,
    disableEnableCheckbox: props.disableEnableCheckbox,
    symbolLeverage: props.symbolLeverage,
  };
};
