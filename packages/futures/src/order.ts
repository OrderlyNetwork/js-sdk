/**
 * 下单时的最高价格
 * @see https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Max-price
 */
export function maxPrice(markprice: number, range: number) {
  return markprice * (1 + range);
}

/**
 * 下单时的最低价格
 * @see https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Min-price
 */
export function minPrice(markprice: number, range: number) {
  return markprice * (1 - range);
}
