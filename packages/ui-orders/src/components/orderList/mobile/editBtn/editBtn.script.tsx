import { useCallback } from "react";
import { useSymbolsInfo } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { modal } from "@kodiak-finance/orderly-ui";
import { PositionTPSLSheet } from "@kodiak-finance/orderly-ui-tpsl";
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
  const { position } = useTPSLOrderRowContext();

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
              state={state}
              position={position}
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
