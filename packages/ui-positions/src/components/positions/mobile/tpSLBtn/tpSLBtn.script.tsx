import { useSymbolsInfo } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { PositionTPSLSheet } from "@orderly.network/ui-tpsl";
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
