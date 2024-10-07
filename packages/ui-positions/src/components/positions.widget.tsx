import { PositionsProps } from "../types/types";
import { MobilePositions, Positions } from "./positions.ui";
import { usePositionsBuilder } from "./usePositionsBuilder.script";

export const PositionsWidget = (props: PositionsProps) => {
  const state = usePositionsBuilder();
  return (
    <Positions
      {...state}
      pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
      sharePnLConfig={props.sharePnLConfig}
    />
  );
};


export const MobilePositionsWidget = (props: PositionsProps) => {
  const state = usePositionsBuilder();
  return (
    <MobilePositions
      {...state}
      pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision}
      sharePnLConfig={props.sharePnLConfig}
    />
  );
};
