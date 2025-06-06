import React from "react";
import { useFeesScript } from "./fees.script";
import { FeesUI } from "./fees.ui";

export const FeesWidget: React.FC = () => {
  const state = useFeesScript();
  return <FeesUI {...state} />;
};
