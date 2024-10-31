import { useCallback } from "react";
import { useSessionStorage } from "@orderly.network/hooks";
import { SortOrder } from "@orderly.network/ui";

type Sort = {
  sortKey: string;
  sortOrder: SortOrder;
};

export type TabSort = Record<string, Sort>;

const defaultSortKey = "24h_amount";
const defaultSortOrder = "desc";

export function useTabSort(options: {
  storageKey: string;
  type?: string;
  initialSort?: Sort;
}) {
  const { storageKey, type = "all", initialSort } = options;

  const [tabSort, setTabSort] = useSessionStorage(storageKey, {
    [type]: {
      sortKey: initialSort?.sortKey || defaultSortKey,
      sortOrder: initialSort?.sortOrder || defaultSortOrder,
    },
  } as TabSort);

  // default all tab can storage sort
  const onTabSort = useCallback(
    (sortKey = defaultSortKey, sortOrder = defaultSortOrder) => {
      setTabSort({
        ...tabSort,
        all: {
          sortKey,
          sortOrder,
        },
      });
    },
    []
  );

  return {
    tabSort: tabSort[type],
    onTabSort,
  };
}
