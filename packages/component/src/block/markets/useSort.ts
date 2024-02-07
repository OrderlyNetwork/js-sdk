import { useMemo, useState } from "react";
import { SortDirection, SortKey, parseSortDirection } from "./shared/types";
import { parseNumStr } from "@orderly.network/utils";

export const useSort = (value?: SortKey, readLastSortCondition?: boolean) => {
  const sessionSortKey = sessionStorage.getItem("default_sort_key") || "vol";
  const sessionSortDirection = sessionStorage.getItem("default_sort_derection") || "2";
  const initSortKey = readLastSortCondition ? value || sessionSortKey : undefined;
  const initDirection = readLastSortCondition ? (parseSortDirection(sessionSortDirection) || SortDirection.DESC) : SortDirection.NONE;
  // @ts-ignore
  const [sortKey, setSortKey] = useState<SortKey | undefined>(initSortKey);
  const [direction, setDirection] = useState<SortDirection>(initDirection);

  const onSort = (value: SortKey) => {
    if (value === sortKey) {
      setDirection((d) => {
        let result;
        if (d === SortDirection.NONE) {
          result = SortDirection.DESC;
        } else if (d === SortDirection.DESC) {
          result = SortDirection.ASC;
        } else {
          result = SortDirection.NONE;
        }

        sessionStorage.setItem("default_sort_derection", result.toString());
        return result;
      });
    } else {
      setSortKey(value);
      setDirection(SortDirection.DESC);
      sessionStorage.setItem("default_sort_key", value);
      sessionStorage.setItem("default_sort_derection", SortDirection.DESC.toString());
    }
  };

  const currentValue = useMemo(
    () => ({
      key: sortKey,
      direction: direction,
    }),
    [sortKey, direction]
  );

  return {
    sortKey,
    direction,
    value: currentValue,
    onSort,
  };
};
