import { PositionsProps } from "../types/types";
import { MobilePositions, Positions } from "./positions.ui";
import { usePositionsBuilder } from "./usePositionsBuilder.script";

export const PositionsWidget = (props: PositionsProps) => {
  const state = usePositionsBuilder(props);
  return <Positions {...state} />;
};

export const MobilePositionsWidget = (props: PositionsProps) => {
  const state = usePositionsBuilder(props);
  return <MobilePositions {...state} />;
};
