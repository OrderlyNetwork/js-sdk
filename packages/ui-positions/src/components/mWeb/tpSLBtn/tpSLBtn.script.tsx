import { useState } from "react";
import { useSymbolContext } from "../../../providers/symbolProvider";
import { PositionCellState } from "../positionCell/positionCell.script";
import { modal } from "@orderly.network/ui";
import { usePositionsRowContext } from "../../desktop/positionRowContext";
import { POSITION_TP_SL_SHEET_ID } from "../tpsl/tp_sl_sheet.widget";

export const useTpSLBtnScript = (props: { state: PositionCellState }) => {
  const symbolInfo = useSymbolContext();
  const ctx = usePositionsRowContext();

  const openTP_SL = () => {
    modal.show(POSITION_TP_SL_SHEET_ID, {
      position: ctx.position,
    });
  };
  return {
    openTP_SL,
    ...props,
    ...symbolInfo,
  };
};

export type TpSLBtnState = ReturnType<typeof useTpSLBtnScript>;
