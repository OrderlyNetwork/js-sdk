import { API } from "@orderly.network/types";
import { PositionsProps } from "../../../../types/types";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { useSymbolContext } from "../../../../providers/symbolProvider";

export const usePositionCellScript = (
  props: {
    item: API.PositionTPSLExt;
    index: number;
  } & PositionsProps
) => {
  const symbolInfo = useSymbolContext();
  return {
    ...props,
    ...symbolInfo,
  };
};

export type PositionCellState = ReturnType<typeof usePositionCellScript>;
