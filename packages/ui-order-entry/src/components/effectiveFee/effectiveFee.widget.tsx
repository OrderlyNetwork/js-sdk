import React from "react";
import { useEffectiveFeeScript } from "./effectiveFee.script";
import { EffectiveFeeUI } from "./effectiveFee.ui";

export const EffectiveFeeWidget: React.FC = () => {
  const state = useEffectiveFeeScript();
  return <EffectiveFeeUI {...state} />;
};
