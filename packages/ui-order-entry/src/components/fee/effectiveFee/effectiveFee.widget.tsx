import React from "react";
import { useFeeState } from "@orderly.network/hooks";
import { EffectiveFeeUI } from "./effectiveFee.ui";

export const EffectiveFeesWidget: React.FC<{ taker: string; maker: string }> = (
  props,
) => {
  return <EffectiveFeeUI {...props} />;
};
