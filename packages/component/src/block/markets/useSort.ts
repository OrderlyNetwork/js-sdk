import { useMemo, useState } from "react";
import { SortKey } from "./sections/sortItem";
import { SortDirection } from "./types";

export const useSort = (value?: SortKey) => {
  const [sortKey, setSortKey] = useState<SortKey | undefined>(value);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.NONE);

  const onSort = (value: SortKey) => {
    if (value === sortKey) {
      setDirection((d) => {
        if (d === SortDirection.NONE) {
          return SortDirection.DESC;
        } else if (d === SortDirection.DESC) {
          return SortDirection.ASC;
        } else {
          return SortDirection.NONE;
        }
      });
    } else {
      setSortKey(value);
      setDirection(SortDirection.DESC);
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
