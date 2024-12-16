import { usePositionHeaderScript } from "./positionHeader.script";
import { PositionHeader } from "./positionHeader.ui";

export const PositionHeaderWidget = (props: {
  pnlNotionalDecimalPrecision?: number;
  unPnlPriceBasis: "markPrice" | "lastPrice";
  symbol?: string;
}) => {
  const state = usePositionHeaderScript(props);
  return <PositionHeader {...state}/>;
};
