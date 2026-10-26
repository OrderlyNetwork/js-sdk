import { useMemo, useSyncExternalStore } from "react";
import { useSWRConfig } from "@orderly.network/hooks";
import { useWS } from "@orderly.network/hooks";
import {
  EMPTY_BOOK_SNAPSHOT,
  getOrderbookResource,
} from "../data/orderbookRegistry";

export type {
  BinaryBookLevel,
  BinaryOrderBook,
} from "../data/orderbookRegistry";
export { EMPTY_BOOK } from "../data/orderbookRegistry";
const inactive = {
  getSnapshot: () => EMPTY_BOOK_SNAPSHOT,
  subscribe: () => () => {},
  reset: () => {},
};
/** Consumers share one snapshot/delta chain per cache, socket and round symbol. */
export const useBinaryOrderbook = (
  symbol: string | undefined,
  active: boolean,
) => {
  const ws = useWS();
  const { cache } = useSWRConfig();
  const resource = useMemo(
    () =>
      active && symbol ? getOrderbookResource(cache, ws, symbol) : inactive,
    [cache, ws, symbol, active],
  );
  const snapshot = useSyncExternalStore(
    resource.subscribe,
    resource.getSnapshot,
    inactive.getSnapshot,
  );
  return { ...snapshot, reset: resource.reset };
};
export type BinaryOrderbookState = ReturnType<typeof useBinaryOrderbook>;
