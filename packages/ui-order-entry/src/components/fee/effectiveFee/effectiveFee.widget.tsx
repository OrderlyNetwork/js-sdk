import React from "react";
import { useFeeState } from "@veltodefi/hooks";
import { EffectiveFeeUI } from "./effectiveFee.ui";

export const EffectiveFeesWidget: React.FC<{ taker: string; maker: string }> = (
  props,
) => {
  return <EffectiveFeeUI {...props} />;
};
