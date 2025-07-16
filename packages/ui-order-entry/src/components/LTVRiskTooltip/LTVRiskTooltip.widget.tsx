import React from "react";
import { useLTVTooltipScript } from "./LTVRiskTooltip.script";
import { LTVRiskTooltipUI } from "./LTVRiskTooltip.ui";

export const LTVRiskTooltipWidget: React.FC = () => {
  const state = useLTVTooltipScript();
  return <LTVRiskTooltipUI {...state} />;
};
