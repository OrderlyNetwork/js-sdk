import { useCallback } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { modal } from "@orderly.network/ui";
import { PositionTPSLSheet, TPSLSheetId } from "@orderly.network/ui-tpsl";
import { TabType } from "../../../orders.widget";
import { useOrderListContext } from "../../orderListContext";
import { useTPSLOrderRowContext } from "../../tpslOrderRowContext";
import { EditSheetWidget } from "../editSheet";
import { OrderCellState } from "../orderCell.script";

export const useEditBtnScript = (props: { state: OrderCellState }) => {
  const { state } = props;
  const { t } = useTranslation();
  const symbolInfo = useSymbolsInfo()[props.state.item.symbol]();

  const { editAlgoOrder, editOrder } = useOrderListContext();
  const { order, position } = useTPSLOrderRowContext();

  const onShowEditSheet = useCallback(() => {
    if (props.state.type === TabType.tp_sl) {
      modal
        .sheet({
          content: (
            <PositionTPSLSheet
              symbol={props.state.item.symbol}
              symbolInfo={symbolInfo}
              isEditing
              order={props.state.item}
            />
          ),
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      modal
        .sheet({
          title: t("orders.editOrder"),
          // size: "xs",
          classNames: {
            content: "oui-bg-base-8",
          },
          content: (
            <EditSheetWidget
              position={position}
              state={state}
              editAlgoOrder={editAlgoOrder}
              editOrder={editOrder}
            />
          ),
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [state]);

  return {
    ...state,
    onShowEditSheet,
  };
};

export type EditBtnState = ReturnType<typeof useEditBtnScript>;
