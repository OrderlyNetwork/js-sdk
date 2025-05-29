import { useCallback, useEffect, useState } from "react";
import { TableSort } from "@orderly.network/ui";
import { SortType } from "./type";

/** get page data */
export function getPagedData(list: any[], pageSize: number, pageIndex: number) {
  const pageData: any[][] = [];
  let rows: any[] = [];
  for (let i = 0; i < list.length; i++) {
    rows.push(list[i]);
    if ((i + 1) % pageSize === 0 || i === list.length - 1) {
      pageData.push(rows);
      rows = [];
    }
  }
  return pageData[pageIndex - 1] || [];
}

export function sortList(list: any[], sort?: SortType) {
  const { sortKey, sortOrder } = sort || {};
  const sortedList = [...(list || [])];

  const isEmpty = (value: any) => value === undefined || value === null;

  if (sortKey && sortOrder) {
    // sort list
    sortedList.sort((a: any, b: any) => {
      const val1 = a[sortKey];
      const val2 = b[sortKey];

      if (isEmpty(val1)) return 1;
      if (isEmpty(val2)) return -1;

      if (sortOrder === "desc") {
        return val2 - val1;
      }

      return val1 - val2;
    });
  }
  return sortedList;
}

export function useSort(
  initialSort?: SortType,
  onSortChange?: (sort?: SortType) => void,
) {
  const [sort, setSort] = useState<SortType | undefined>(initialSort);

  const onSort = useCallback((options?: TableSort) => {
    const nextSort = options
      ? {
          sortKey: options.sortKey,
          sortOrder: options.sort,
        }
      : undefined;

    setSort(nextSort);
    onSortChange?.(nextSort);
    // initialSort, onSortChange is not needed to be in the dependency array, otherwise it will cause infinite loop
  }, []);

  const getSortedList = useCallback(
    (list: any[]) => sortList(list, sort),
    [sort],
  );

  return { sort, onSort, getSortedList };
}

export function searchBySymbol<T extends { symbol: string }>(
  list: T[],
  searchValue = "",
  formatString?: string,
) {
  if (!searchValue) return list;

  const reg = new RegExp(searchValue, "i");
  const searchValueLower = searchValue.toLowerCase();

  // Split results into three groups: exact matches, starts with search and other matches
  const exactMatches: T[] = [];
  const startsWithMatches: T[] = [];
  const otherMatches: T[] = [];

  list?.forEach((item) => {
    const formattedSymbol = formatSymbol(item.symbol, formatString);
    const symbolLower = formattedSymbol.toLowerCase();
    if (reg.test(formattedSymbol)) {
      if (symbolLower === searchValueLower) {
        exactMatches.push(item);
      } else if (symbolLower.startsWith(searchValueLower)) {
        startsWithMatches.push(item);
      } else {
        otherMatches.push(item);
      }
    }
  });

  const compareSymbols = (a: T, b: T) => {
    const symbolA = formatSymbol(a.symbol, formatString);
    const symbolB = formatSymbol(b.symbol, formatString);
    if (symbolA < symbolB) return -1;
    if (symbolA > symbolB) return 1;
    return 0;
  };

  // Sort each group alphabetically
  startsWithMatches.sort(compareSymbols);
  otherMatches.sort(compareSymbols);

  // Combine results with prioritized matches first
  return [...exactMatches, ...startsWithMatches, ...otherMatches];
}

function formatSymbol(symbol: string, formatString: string = "base") {
  const arr = symbol.split("_");
  const type = arr[0];
  const base = arr[1];
  const quote = arr[2];

  return formatString
    .replace("type", type)
    .replace("base", base)
    .replace("quote", quote);
}

export function useSize() {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);

    const handleResize = () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    };

    window?.addEventListener("resize", handleResize);

    return () => {
      window?.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    width,
    height,
  };
}
