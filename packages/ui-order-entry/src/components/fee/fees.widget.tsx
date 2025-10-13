import React from "react";
import { pick } from "ramda";
import { useFeeState } from "@kodiak-finance/orderly-hooks";
import { EffectiveFeesWidget } from "./effectiveFee";
import { RegularFeesWidget } from "./regularFee";

const isEffective = (val?: unknown) =>
  typeof val !== "undefined" && val !== null;

export const FeesWidget: React.FC = () => {
  const { refereeRebate, ...others } = useFeeState();
  return isEffective(refereeRebate) ? (
    <EffectiveFeesWidget
      {...pick(["effectiveTakerFee", "effectiveMakerFee"], others)}
    />
  ) : (
    <RegularFeesWidget {...pick(["takerFee", "makerFee"], others)} />
  );
};
