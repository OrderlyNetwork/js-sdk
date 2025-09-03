import React from "react";
import { useFeeScript } from "../fees.script";
import { EffectiveFeeUI } from "./effectiveFee.ui";

export const EffectiveFeesWidget: React.FC<
  Pick<
    ReturnType<typeof useFeeScript>,
    "effectiveTakerFee" | "effectiveMakerFee"
  >
> = (props) => {
  return <EffectiveFeeUI {...props} />;
};
