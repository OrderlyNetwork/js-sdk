import type { Cache, useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { API, WSMessage } from "@orderly.network/types";
import { isBinarySymbol } from "@orderly.network/utils";
import type { getKeyFunction } from "../provider/dataCenter/dataCenterContext";
import {
  AlgoOrderFieldChanges,
  AlgoOrderMergeHandler,
} from "../services/orderMerge/algoOrderMergeHandler";
import { RegularOrderMergeHandler } from "../services/orderMerge/regularOrderMergeHandler";
import { scheduleOrderQueryRefresh } from "./orderQueryRefresh";

/** Apply reports only to matching queries; let REST resolve dates and page boundaries. */
export function updateOrderCaches(options: {
  keys: Map<string, getKeyFunction>;
  cache: Cache;
  mutate: ReturnType<typeof useSWRConfig>["mutate"];
  accountId: string;
  message: WSMessage.Order | WSMessage.AlgoOrder[];
  isAlgoOrder: boolean;
  isCurrent: () => boolean;
}) {
  const { keys, cache, mutate, accountId, message, isAlgoOrder, isCurrent } =
    options;
  const handler = isAlgoOrder
    ? new AlgoOrderMergeHandler(message as WSMessage.AlgoOrder[])
    : new RegularOrderMergeHandler(message as WSMessage.Order);
  let fieldChanges: AlgoOrderFieldChanges = {};

  keys.forEach((getKey, key) => {
    if (!key.startsWith(isAlgoOrder ? "algoOrders" : "orders")) return;
    const url = getKey(0, null);
    if (!url || !isCurrent()) return;
    const search = new URLSearchParams(url.split("?")[1]);
    const cacheKey = unstable_serialize((index, previous) => [
      getKey(index, previous),
      accountId,
    ]);
    const previous = cache.get(cacheKey)?.data as
      | API.OrderResponse[]
      | undefined;
    const indices = previous && handler.findOrderIndex(previous);
    const existing = indices && previous![indices[0]].rows[indices[1]];
    // Execution updates may omit immutable fields. Use the cached order to
    // resolve direction/product, but never guess date membership from timestamp.
    const order = { ...existing, ...handler.data };
    let unknown = false;
    let mismatch = false;
    for (const field of ["side", "symbol"] as const) {
      const expected = search.get(field);
      if (!expected || expected.toLowerCase() === "all") continue;
      if (!order[field]) unknown = true;
      else if (order[field].toUpperCase() !== expected.toUpperCase())
        mismatch = true;
    }
    const product = search.get("product_type")?.toUpperCase();
    if (product === "PERP" || product === "BINARY") {
      if (!order.symbol) unknown = true;
      else if (isBinarySymbol(order.symbol) !== (product === "BINARY"))
        mismatch = true;
    }

    if (mismatch && !existing) return;
    if (handler instanceof AlgoOrderMergeHandler && previous)
      fieldChanges = { ...fieldChanges, ...handler.getFieldChanges(previous) };

    if (
      unknown ||
      mismatch ||
      search.has("start_t") ||
      search.has("end_t") ||
      Number(search.get("page")) > 1 ||
      (previous?.length ?? 0) > 1 ||
      !previous
    ) {
      scheduleOrderQueryRefresh(cache, url, accountId, isCurrent);
      return;
    }

    // Construct a fresh handler per cache: update() can restore its creation time.
    void mutate(
      cacheKey,
      (current?: API.OrderResponse[]) => {
        if (!current || !isCurrent()) return current;
        try {
          if (isAlgoOrder) {
            const report = message as WSMessage.AlgoOrder[];
            return new AlgoOrderMergeHandler(report).merge(
              key,
              report,
              current,
            );
          }
          const report = message as WSMessage.Order;
          return new RegularOrderMergeHandler(report).merge(
            key,
            report,
            current,
          );
        } catch {
          return current;
        }
      },
      { revalidate: false },
    ).catch(() => undefined);
  });
  return { fieldChanges };
}
