import React from "react";
import { usePositionsRowContext } from "@orderly.network/ui-positions";
import { useTPSLBuilder } from "./TPSLDialog.script";
import { TPSLDialogUI } from "./TPSLDialog.ui";

export const TPSLDialogWidget: React.FC = () => {
  return <TPSLDialogUI />;
};
