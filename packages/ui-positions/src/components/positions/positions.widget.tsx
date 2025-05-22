import React from "react";
import { PositionsProps } from "../../types/types";
import { MobilePositions, Positions } from "./positions.ui";
import { usePositionsBuilder } from "./usePositionsBuilder.script";

export const PositionsWidget: React.FC<PositionsProps> = (props) => {
  const state = usePositionsBuilder(props);
  return <Positions {...state} />;
};

export const MobilePositionsWidget: React.FC<PositionsProps> = (props) => {
  const state = usePositionsBuilder(props);
  return <MobilePositions {...state} />;
};
