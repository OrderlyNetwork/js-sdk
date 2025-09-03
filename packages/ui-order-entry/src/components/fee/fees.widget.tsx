import React from "react";
import { EffectiveFeesWidget } from "./effectiveFee";
import { useFeeScript } from "./fees.script";
import { RegularFeesWidget } from "./regularFee";

const isEffective = (val: unknown) =>
  typeof val !== "undefined" && val !== null;

export const FeesWidget: React.FC = () => {
  const { rebateRate, ...others } = useFeeScript();
  return isEffective(rebateRate) ? (
    <EffectiveFeesWidget {...others} />
  ) : (
    <RegularFeesWidget {...others} />
  );
};
