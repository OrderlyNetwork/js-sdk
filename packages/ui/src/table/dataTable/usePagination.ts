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
    const size = meta?.records_per_page ?? pageSize;
    const pageTotal = count ? Math.ceil(count / size) : 0;
    const curPage = Math.min(meta?.current_page ?? page, pageTotal);
    return {
      count,
      page: curPage,
      pageSize: size,
      pageTotal: pageTotal,
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
