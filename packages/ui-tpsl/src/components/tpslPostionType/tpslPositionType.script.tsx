import { useState } from "react";
import { OrderlyOrder, PositionType } from "@veltodefi/types";

type OrderValueKeys = keyof OrderlyOrder;
export type PositionTypeProps = {
  disableSelector?: boolean;
  value: PositionType;
  onChange: (key: OrderValueKeys, value: any) => void;
};

export const useTPSLPositionTypeScript = (props: PositionTypeProps) => {
  return {
    value: props.value,
    onChange: props.onChange,
    disableSelector: props.disableSelector,
  };
};
