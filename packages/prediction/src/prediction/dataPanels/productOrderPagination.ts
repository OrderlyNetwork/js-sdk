/** Load at the page boundary so rows-based totals cannot hide the next page. */
export function shouldLoadMoreProductOrders({
  loaded,
  page,
  hasMore,
  isValidating,
}: {
  loaded: number;
  page: number;
  hasMore: boolean;
  isValidating: boolean;
}) {
  return hasMore && !isValidating && loaded <= page * 20;
}
