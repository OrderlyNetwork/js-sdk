import { API } from "@orderly.network/types";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { useModal } from "@orderly.network/ui";

export const useTPSLSheetScript = (props: { position: API.Position }) => {
  const symbolInfo = useSymbolsInfo()[props.position.symbol]();
  const modal = useModal();

  const updateSheetTitle = (title: string) => {
    modal.updateArgs({ title });
  };

  return {
    symbolInfo,
    updateSheetTitle,
  };
};

export type TPSLSheetState = ReturnType<typeof useTPSLSheetScript>;
