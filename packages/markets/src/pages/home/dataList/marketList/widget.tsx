import { MarketList } from "./marketList.ui";
import { useMarketListScript } from "./marketList.script";
import { SortOrder } from "@orderly.network/ui";

export type MarketListWidgetProps = {
  sortKey: string;
  sortOrder: SortOrder;
};

export const MarketListWidget: React.FC<MarketListWidgetProps> = (props) => {
  const state = useMarketListScript(props);
  return <MarketList {...state} />;
};
