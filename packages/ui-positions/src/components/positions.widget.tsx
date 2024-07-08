import { Positions } from "./positions.ui";
import { usePositionsBuilder } from "./usePositionsBuilder.script";

export const PositionsWidget = () => {
  const state = usePositionsBuilder();
  return <Positions {...state} />;
};
