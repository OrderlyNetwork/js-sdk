import { useCallback } from "react";
import { useSessionStorage } from "@orderly.network/hooks";
import { SortType, TabName } from "../../../type";

export function useTabSort(options: { storageKey: string }) {
  const [tabSort, setTabSort] = useSessionStorage(options.storageKey, {
    [TabName.All]: {
      sortKey: "24h_amount",
      sortOrder: "desc",
    },
  } as Record<TabName, SortType>);

  const onTabSort = useCallback(
    (type: TabName) => (sort?: SortType) => {
      console.log("onTabSort", type, sort);
      setTabSort({ ...tabSort, [type]: sort });
    },
    [tabSort],
  );

  return {
    tabSort,
    onTabSort,
  };
}
