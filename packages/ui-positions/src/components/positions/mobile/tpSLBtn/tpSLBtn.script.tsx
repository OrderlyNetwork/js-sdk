import { PositionCellState } from "../positionCell/positionCell.script";
import { modal } from "@orderly.network/ui";
import { PositionTPSLSheet } from "@orderly.network/ui-tpsl";
import { API } from "@orderly.network/types";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { usePositionsRowContext } from "../../desktop/positionRowContext";

export const useTpSLBtnScript = (props: { state: PositionCellState }) => {
  const symbolInfo: API.SymbolExt = useSymbolsInfo()[props.state.item.symbol]();
  const { tpslOrder } = usePositionsRowContext();

  const openTP_SL = () => {
    modal.sheet({
      title: "TP/SL",
      content: (
        <PositionTPSLSheet
          position={props.state.item}
          symbolInfo={symbolInfo}
          order={tpslOrder}
          isEditing={false}
        />
      ),
    });
  };

  return {
    openTP_SL,
    ...props,
    ...symbolInfo,
  };
};

export type TpSLBtnState = ReturnType<typeof useTpSLBtnScript>;
