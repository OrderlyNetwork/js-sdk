import { SortType } from "../../type";
import { useMarketsListFullScript } from "./marketsListFull.script";
import { MarketsListFull } from "./marketsListFull.ui";

export type MarketsListFullWidgetProps = {
  type?: "all" | "new";
  initialSort?: SortType;
};

export const MarketsListFullWidget: React.FC<MarketsListFullWidgetProps> = (
  props,
) => {
  const state = useMarketsListFullScript(props);

  return <MarketsListFull {...state} type={props.type} />;
};
