/** Load at the page boundary so rows-based totals cannot hide the next page. */
export function shouldLoadMoreProductOrders({
  loaded,
  page,
  pageSize = 20,
  hasMore,
  isValidating,
}: {
  loaded: number;
  page: number;
  pageSize?: number;
  hasMore: boolean;
  isValidating: boolean;
}) {
  return hasMore && !isValidating && loaded <= page * pageSize;
}
