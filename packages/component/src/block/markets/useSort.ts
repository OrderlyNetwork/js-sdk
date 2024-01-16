import { useMemo, useState } from "react";
import { SortKey } from "./sections/sortItem";
import { SortDirection, parseSortDirection } from "./shared/types";
import { parseNumStr } from "@orderly.network/utils";

export const useSort = (value?: SortKey) => {
  const sessionSortKey = sessionStorage.getItem("default_sort_key") || "vol";
  const sessionSortDirection = sessionStorage.getItem("default_sort_derection") || "2";
  const [sortKey, setSortKey] = useState<SortKey | undefined>(value || sessionSortKey);
  const [direction, setDirection] = useState<SortDirection>(parseSortDirection(sessionSortDirection) || SortDirection.DESC);

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
