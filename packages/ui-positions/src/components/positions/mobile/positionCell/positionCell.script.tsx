import { API } from "@orderly.network/types";
import { useSymbolContext } from "../../../../provider/symbolContext";
import { PositionsProps } from "../../../../types/types";

type PositionCellScriptProps = {
  item: API.PositionTPSLExt;
  index: number;
} & PositionsProps;

export type PositionCellState = ReturnType<typeof usePositionCellScript>;

export const usePositionCellScript = (props: PositionCellScriptProps) => {
  const symbolInfo = useSymbolContext();
  return {
    ...props,
    ...symbolInfo,
  };
};
