import React from "react";
import { useFeeState } from "@kodiak-finance/orderly-hooks";
import { EffectiveFeeUI } from "./effectiveFee.ui";

export const EffectiveFeesWidget: React.FC<
  Pick<
    ReturnType<typeof useFeeState>,
    "effectiveTakerFee" | "effectiveMakerFee"
  >
> = (props) => {
  return <EffectiveFeeUI {...props} />;
};
