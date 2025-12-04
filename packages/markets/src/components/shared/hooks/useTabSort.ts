import { useCallback } from "react";
import { useSessionStorage } from "@veltodefi/hooks";
import { SortType, MarketsTabName } from "../../../type";

export function useTabSort(options: { storageKey: string }) {
  const [tabSort, setTabSort] = useSessionStorage(options.storageKey, {
    [MarketsTabName.All]: {
      sortKey: "24h_amount",
      sortOrder: "desc",
    },
  } as Record<MarketsTabName, SortType>);

  const onTabSort = useCallback(
    (type: MarketsTabName) => (sort?: SortType) => {
      setTabSort({ ...tabSort, [type]: sort });
    },
    [tabSort],
  );

  return {
    tabSort,
    onTabSort,
  };
}
