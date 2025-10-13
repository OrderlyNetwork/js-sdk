import { useCallback, useEffect, useState } from "react";
import { TableSort } from "@kodiak-finance/orderly-ui";
import { formatSymbol } from "@kodiak-finance/orderly-utils";
import { SortType } from "./type";

/**
 * Compare two values intelligently
 */
const compareValues = (aValue: any, bValue: any): number => {
  // Handle null/undefined values (always sort to bottom)
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  // Convert to string first for type checking
  const aStr = String(aValue).trim();
  const bStr = String(bValue).trim();

  // More robust number detection - check if values can be converted to valid numbers
  const aNum = Number(aStr);
  const bNum = Number(bStr);
  const aIsNumber =
    !isNaN(aNum) && isFinite(aNum) && /^-?\d*\.?\d+([eE][+-]?\d+)?$/.test(aStr);
  const bIsNumber =
    !isNaN(bNum) && isFinite(bNum) && /^-?\d*\.?\d+([eE][+-]?\d+)?$/.test(bStr);

  if (aIsNumber && bIsNumber) {
    return aNum - bNum;
  }

  // Check if both are valid dates (ISO format or timestamp)
  const aIsDate = /^\d{4}-\d{2}-\d{2}/.test(aStr) || /^\d{13}$/.test(aStr);
  const bIsDate = /^\d{4}-\d{2}-\d{2}/.test(bStr) || /^\d{13}$/.test(bStr);

  if (aIsDate && bIsDate) {
    const aDate = new Date(aValue);
    const bDate = new Date(bValue);
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return aDate.getTime() - bDate.getTime();
    }
  }

  // String comparison - use localeCompare for proper string sorting
  return aStr.localeCompare(bStr, undefined, {
    sensitivity: "base",
    numeric: false, // Disable numeric sorting for pure string comparison
    caseFirst: "upper",
  });
};

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

  if (sortKey && sortOrder) {
    // sort list
    sortedList.sort((a: any, b: any) => {
      const comparison = compareValues(a[sortKey], b[sortKey]);
      // Handle sort order: desc means reverse the comparison result
      return sortOrder === "desc" ? -comparison : comparison;
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

/**
 * Escape special characters for use in regular expressions
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function searchBySymbol<T extends Record<PropertyKey, any>>(
  list: T[],
  searchValue = "",
  formatString?: string,
) {
  if (!searchValue) {
    return list;
  }

  // Escape special characters to prevent RegExp errors
  const escapedSearchValue = escapeRegExp(searchValue);
  const reg = new RegExp(escapedSearchValue, "i");

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
