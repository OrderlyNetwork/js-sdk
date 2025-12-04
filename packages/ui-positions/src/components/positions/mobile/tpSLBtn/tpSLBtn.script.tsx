import { useSymbolsInfo } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { API } from "@veltodefi/types";
import { modal } from "@veltodefi/ui";
import { PositionTPSLSheet } from "@veltodefi/ui-tpsl";
import { usePositionsRowContext } from "../../positionsRowContext";
import { PositionCellState } from "../positionCell/positionCell.script";

export const useTpSLBtnScript = (props: { state: PositionCellState }) => {
  const symbolInfo: API.SymbolExt = useSymbolsInfo()[props.state.item.symbol]();
  const { tpslOrder } = usePositionsRowContext();
  const { t } = useTranslation();

  const openTP_SL = () => {
    modal.sheet({
      title: t("common.tpsl"),
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
