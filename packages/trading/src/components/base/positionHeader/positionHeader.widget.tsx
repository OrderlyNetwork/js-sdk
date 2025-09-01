import React from "react";
import { usePositionHeaderScript } from "./positionHeader.script";
import { PositionHeader } from "./positionHeader.ui";

export const PositionHeaderWidget: React.FC<{
  pnlNotionalDecimalPrecision?: number;
  unPnlPriceBasis: "markPrice" | "lastPrice";
  symbol?: string;
}> = (props) => {
  const state = usePositionHeaderScript(props);
  return <PositionHeader {...state} />;
};
