import React from "react";
import { useFeeState } from "@orderly.network/hooks";
import { EffectiveFeesWidget } from "./effectiveFee";
import { RegularFeesWidget } from "./regularFee";

const isEffective = (val?: unknown) =>
  typeof val !== "undefined" && val !== null;

export const FeesWidget: React.FC = () => {
  const { refereeRebate, ...others } = useFeeState();
  return isEffective(refereeRebate) ? (
    <EffectiveFeesWidget {...others} />
  ) : (
    <RegularFeesWidget {...others} />
  );
};
