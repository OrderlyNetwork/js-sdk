import React from "react";
import { useLtvScript } from "./ltv.script";
import { LtvUI } from "./ltv.ui";

export const LtvWidget: React.FC = () => {
  const state = useLtvScript();
  return <LtvUI {...state} />;
};
