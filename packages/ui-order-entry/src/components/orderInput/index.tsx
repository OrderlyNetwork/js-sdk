import { FocusEventHandler } from "react";
import { OrderValidationResult } from "@orderly.network/hooks";
import { API, OrderlyOrder, OrderType } from "@orderly.network/types";
import { OrderEntryScriptReturn } from "../../orderEntry.script";
import { InputType } from "../../types";
import { CommonOrderInput } from "./commonOrderInput";
import { ScaledOrderInput } from "./scaledOrderInput";

export type BaseOrderInputProps = {
  type: OrderType;
  symbolInfo: API.SymbolExt;
  values: Partial<OrderlyOrder>;
  onChange: (key: keyof OrderlyOrder, value: any) => void;
  onValuesChange: (value: any) => void;
  onFocus: (type: InputType) => FocusEventHandler;
  onBlur: (type: InputType, tick?: number) => FocusEventHandler;
  parseErrorMsg: (
    key: keyof OrderValidationResult,
    customValue?: string,
  ) => string;
  errors: OrderValidationResult | null;
};

export type OrderInputProps = BaseOrderInputProps & {
  bbo: Pick<
    OrderEntryScriptReturn,
    "bboStatus" | "bboType" | "onBBOChange" | "toggleBBO"
  >;
  refs: OrderEntryScriptReturn["refs"];
  priceInputContainerWidth?: number;
  fillMiddleValue: OrderEntryScriptReturn["fillMiddleValue"];
};

export function OrderInput(props: OrderInputProps) {
  const { bbo, refs, priceInputContainerWidth, fillMiddleValue, ...rest } =
    props;

  if (props.values.order_type === OrderType.SCALED) {
    return <ScaledOrderInput {...rest} />;
  }

  return (
    <CommonOrderInput
      {...rest}
      bbo={bbo}
      refs={refs}
      priceInputContainerWidth={priceInputContainerWidth}
      fillMiddleValue={fillMiddleValue}
    />
  );
}
