import { useState } from "react";
import { OrderlyOrder, PositionType } from "@orderly.network/types";

type OrderValueKeys = keyof OrderlyOrder;
type PositionTypeProps = {
  value: PositionType;
  onChange: (key: OrderValueKeys, value: any) => void;
};

export const useTPSLPositionTypeScript = (props: PositionTypeProps) => {
  return {
    value: props.value,
    onChange: props.onChange,
  };
};
