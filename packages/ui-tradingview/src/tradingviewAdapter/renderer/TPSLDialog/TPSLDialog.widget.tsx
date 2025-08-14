import React from "react";
import { TPSLDialogUI } from "./TPSLDialog.ui";

export const TPSLDialogWidget: React.FC<{
  type: "tp" | "sl";
  triggerPrice?: number;
}> = (props) => {
  return <TPSLDialogUI {...props} />;
};
