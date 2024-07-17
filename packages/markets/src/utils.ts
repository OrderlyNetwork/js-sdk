import { SortOrder } from "@orderly.network/ui";
import { useCallback, useState } from "react";

/** get page data */
export function getPageData(list: any[], pageSize: number, pageIndex: number) {
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

export function sortList(list: any[], sortKey?: string, sortOrder?: SortOrder) {
  const sortedList = [...(list || [])];
  if (sortKey && sortOrder) {
    // sort list
    sortedList.sort((a: any, b: any) => {
      const val1 = a[sortKey];
      const val2 = b[sortKey];

      if (val1 === 0) return 1;
      if (val2 === 0) return -1;

      if (sortOrder === "desc") {
        return val2 - val1;
      }

      return val1 - val2;
    });
  }
  return sortedList;
}

export function useSort(defaultSortKey?: string, defaultSortOrder?: SortOrder) {
  const [key, setKey] = useState<string>();
  const [order, setOrder] = useState<SortOrder>();

  const onSort = useCallback((sortKey: string, sort: SortOrder) => {
    setKey(sortKey);
    setOrder(sort);
  }, []);

  const sortKey = key || defaultSortKey;
  const sortOrder = order || defaultSortOrder;

  const getSortedList = useCallback(
    (list: any[]) => sortList(list, sortKey, sortOrder),
    [sortKey, sortOrder]
  );

  return { onSort, getSortedList, sortKey, sortOrder };
}