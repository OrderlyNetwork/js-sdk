import { MarketsList } from "./marketsList.ui";
import { useMarketsListScript } from "./marketsList.script";
import { SortOrder } from "@orderly.network/ui";

export type MarketsListWidgetProps = {
  type?: "all" | "new";
  sortKey: string;
  sortOrder: SortOrder;
};

export const MarketsListWidget: React.FC<MarketsListWidgetProps> = (props) => {
  const state = useMarketsListScript(props);

  // Only all markets store sort
  const sortStore =
    props.type === "all" ? state.favorite.tabSort?.all : undefined;

  return (
    <MarketsList
      {...state}
      initialSort={{
        sortKey: sortStore?.sortKey || props.sortKey,
        sort: (sortStore?.sortOrder as SortOrder) || props.sortOrder,
      }}
    />
  );
};
