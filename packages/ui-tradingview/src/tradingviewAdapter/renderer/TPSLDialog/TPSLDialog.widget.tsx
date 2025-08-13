import React from "react";
import { usePositionsRowContext } from "@orderly.network/ui-positions";
import { useTPSLBuilder } from "./TPSLDialog.script";
import { TPSLDialogUI } from "./TPSLDialog.ui";

export const TPSLDialogWidget: React.FC = () => {
  const { position } = usePositionsRowContext();
  const state = useTPSLBuilder({ position: position });
  return <TPSLDialogUI {...state} />;
};
