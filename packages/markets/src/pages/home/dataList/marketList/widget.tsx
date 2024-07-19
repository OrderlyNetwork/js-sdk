import { MarketList } from "./marketList.ui";
import { useMarketListScript } from "./marketList.script";
import { SortOrder } from "@orderly.network/ui";

export type MarketListWidgetProps = {
  type?: "all" | "new";
  sortKey: string;
  sortOrder: SortOrder;
};

export const MarketListWidget: React.FC<MarketListWidgetProps> = (props) => {
  const state = useMarketListScript(props);

  // Only all markets store sort
  const sortStore =
    props.type === "all" ? state.favorite.tabSort?.all : undefined;

  return (
    <MarketList
      {...state}
      initialSort={{
        sortKey: sortStore?.sortKey || props.sortKey,
        sort: (sortStore?.sortOrder as SortOrder) || props.sortOrder,
      }}
    />
  );
};
