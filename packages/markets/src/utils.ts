import { SortOrder } from "@orderly.network/ui";
import { useCallback, useEffect, useState } from "react";
import { TInitialSort } from "./type";

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

export function sortList(list: any[], sortKey?: string, sortOrder?: SortOrder) {
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
  defaultSortKey?: string,
  defaultSortOrder?: SortOrder,
  onSortChange?: (sortKey?: string, sortOrder?: SortOrder) => void
) {
  const [key, setKey] = useState<string>();
  const [order, setOrder] = useState<SortOrder>();

  const onSort = useCallback(
    (options?: TInitialSort) => {
      setKey(options?.sortKey);
      setOrder(options?.sort);
      onSortChange?.(options?.sortKey, options?.sort);
    },
    [onSortChange]
  );

  const sortKey = key || defaultSortKey;
  const sortOrder = order || defaultSortOrder;

  const getSortedList = useCallback(
    (list: any[]) => sortList(list, sortKey, sortOrder),
    [sortKey, sortOrder]
  );

  return { onSort, getSortedList, sortKey, sortOrder };
}

export function searchBySymbol(list: any[], searchValue = "") {
  const reg = new RegExp(searchValue, "i");
  return list?.filter((item) => reg.test(item.symbol));
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
