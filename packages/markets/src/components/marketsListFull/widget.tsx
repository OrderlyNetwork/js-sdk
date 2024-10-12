import { MarketsListFull } from "./marketsListFull.ui";
import { useMarketsListFullScript } from "./marketsListFull.script";
import { SortOrder } from "@orderly.network/ui";

export type MarketsListFullWidgetProps = {
  type?: "all" | "new";
  sortKey: string;
  sortOrder: SortOrder;
};

export const MarketsListFullWidget: React.FC<MarketsListFullWidgetProps> = (
  props
) => {
  const state = useMarketsListFullScript(props);

  // Only all markets store sort
  const sortStore =
    props.type === "all" ? state.favorite.tabSort?.all : undefined;

  return (
    <MarketsListFull
      {...state}
      type={props.type}
      initialSort={{
        sortKey: sortStore?.sortKey || props.sortKey,
        sort: (sortStore?.sortOrder as SortOrder) || props.sortOrder,
      }}
    />
  );
};
