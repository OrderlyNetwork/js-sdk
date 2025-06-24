import React from "react";
import { LtvUI } from "./ltv.ui";

export const LtvWidget: React.FC<
  Readonly<{ currentLtv: number; newLtv: number }>
> = (props) => {
  return <LtvUI {...props} />;
};
