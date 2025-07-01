import React from "react";
import { LtvUI } from "./ltv.ui";

export const LtvWidget: React.FC<
  Readonly<{ currentLtv: number; nextLTV: number; showDiff?: boolean }>
> = (props) => {
  return <LtvUI {...props} />;
};
