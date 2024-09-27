import { API } from "@orderly.network/types";
import { PositionsProps } from "../../../types/types";

export const usePositionCellScript = (
  props: {
    item: API.PositionTPSLExt;
    index: number;
  } & PositionsProps
) => {
  return {
    ...props,
  };
};

export type PositionCellState = ReturnType<typeof usePositionCellScript>;
