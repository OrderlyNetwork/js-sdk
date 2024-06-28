import { useRef, useState } from "react";

export const usePagination = (initial?: {
  page?: number;
  pageSize?: number;
}) => {
  const dataTotal = useRef(0);
  const [page, setPage] = useState<number>(initial?.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(initial?.pageSize ?? 10);

  /**
   * helper function to parse meta data,
   * the format of meta data is same as the response from the API
   */
  const parseMeta = (meta?: {
    total: number;
    current_page: number;
    records_per_page: number;
  }) => {
    const count = meta?.total ?? dataTotal.current;
    dataTotal.current = count;
    return {
      count,
      page: meta?.current_page ?? page,
      pageSize: meta?.records_per_page ?? pageSize,
      pageTotal: count ? Math.ceil(count / pageSize) : 0,
    };
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize: (pageSize: number) => setPageSize(pageSize),
    parseMeta,
  };
};
