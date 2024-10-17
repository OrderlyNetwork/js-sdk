import { API } from "@orderly.network/types";
import { useLocalStorage, useSymbolsInfo } from "@orderly.network/hooks";
import { useModal } from "@orderly.network/ui";
import { useState } from "react";

export const useTPSLSheetScript = (props: { position: API.Position }) => {
  const symbolInfo: API.SymbolExt = useSymbolsInfo()[props.position.symbol]();
  const modal = useModal();
  const [visible, setVisible] = useState(true);
  const { resolve, hide } = modal;

  const [needConfirm] = useLocalStorage("orderly_position_tp_sl_confirm", true);

  const updateSheetTitle = (title: string) => {
    modal.updateArgs({ title });
  };

  const onCompleted = () => {
    resolve();
    hide();
  };

  return {
    symbolInfo,
    updateSheetTitle,
    visible,
    setVisible,
    needConfirm,
    onCompleted,
  };
};

export type TPSLSheetState = ReturnType<typeof useTPSLSheetScript>;
