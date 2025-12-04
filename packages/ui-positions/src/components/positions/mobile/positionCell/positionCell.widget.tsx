import { FC } from "react";
import { usePositionCellScript } from "./positionCell.script";
import { PositionCell } from "./positionCell.ui";
import { API } from "@veltodefi/types";
import { PositionsProps } from "../../../../types/types";

export const PositionCellWidget: FC<
  {
    item: API.PositionTPSLExt;
    index: number;
    className?: string;
    shareIconSize?: number;
  } & PositionsProps
> = (props) => {
  const state = usePositionCellScript(props);
  return <PositionCell {...state} className={props.className} />;
};
