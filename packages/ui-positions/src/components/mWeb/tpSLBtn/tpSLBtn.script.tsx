import { useSymbolContext } from "../../../providers/symbolProvider";
import { PositionCellState } from "../positionCell/positionCell.script";
import { modal } from "@orderly.network/ui";
import { usePositionsRowContext } from "../../desktop/positionRowContext";
import { TP_SL_SheetWidget } from "../tpsl/tp_sl_sheet.widget";

export const useTpSLBtnScript = (props: { state: PositionCellState }) => {
  const symbolInfo = useSymbolContext();
  const ctx = usePositionsRowContext();

  const openTP_SL = () => {
    modal.sheet({
      title: "TP/SL",
      content: <TP_SL_SheetWidget position={props.state.item} />,
    });
  };

  return {
    openTP_SL,
    ...props,
    ...symbolInfo,
  };
};

export type TpSLBtnState = ReturnType<typeof useTpSLBtnScript>;
