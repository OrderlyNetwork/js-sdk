import { Positions } from "./positions.ui";
import { usePositionsBuilder } from "./usePositionsBuilder.script";

export const PositionsWidget = () => {
  const state = usePositionsBuilder();
  console.log("PositionsWidget", state);
  return <Positions {...state} />;
};
