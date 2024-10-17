import { API } from "@orderly.network/types";
import { useMarkPrice, useSymbolsInfo } from "@orderly.network/hooks";

export const useTPSLSheetScript = (props: { position: API.Position }) => {
  const symbolInfo = useSymbolsInfo()[props.position.symbol]();
  //   const symbolInfo = useSymbolContext();

  //   const { data: markPrice } = useMarkPrice(props.position.symbol);
  return {
    symbolInfo,
    // markPrice,
  };
};

export type TPSLSheetState = ReturnType<typeof useTPSLSheetScript>;
