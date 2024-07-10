import { MarketList } from "./marketList.ui";
import { useMarketListScript } from "./marketList.script";

export type MarketListWidgetProps = {
  type?: "all" | "new";
};

export const MarketListWidget: React.FC<MarketListWidgetProps> = (props) => {
  const state = useMarketListScript({ type: props.type });
  return <MarketList {...state} />;
};
