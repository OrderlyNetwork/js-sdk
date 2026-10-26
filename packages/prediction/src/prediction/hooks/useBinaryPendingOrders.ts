import { useEffect } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import { OrderStatus } from "@orderly.network/types";

interface OrderSnapshotCoverage {
  total?: number;
  loaded: number;
  isLoading?: boolean;
  isValidating?: boolean;
  error?: unknown;
}
const isOrderSnapshotComplete = ({
  total,
  loaded,
  isLoading,
  isValidating,
  error,
}: OrderSnapshotCoverage) =>
  total != null &&
  Number.isInteger(total) &&
  total >= 0 &&
  loaded >= total &&
  !isLoading &&
  !isValidating &&
  !error;

/** Full risk/count snapshot; never substitute a paginated display list. */
export function useBinaryPendingOrders(enabled: boolean) {
  const [orders, stream] = useOrderStream(
    { status: OrderStatus.INCOMPLETE, size: 100, productType: "BINARY" },
    { keeplive: true, enabled, stopOnUnmount: true },
  );
  const total = stream.meta?.total;
  const loaded = orders?.length ?? 0;
  const complete =
    enabled &&
    isOrderSnapshotComplete({
      loaded,
      isLoading: stream.isLoading,
      isValidating: stream.isValidating,
      error: stream.error,
      total,
    });
  useEffect(() => {
    if (
      enabled &&
      total != null &&
      Number.isInteger(total) &&
      total >= 0 &&
      loaded < total &&
      !stream.error &&
      !stream.isLoading &&
      stream.hasMore !== false &&
      !stream.isValidating
    )
      stream.loadMore();
  }, [
    enabled,
    total,
    loaded,
    stream.error,
    stream.isLoading,
    stream.hasMore,
    stream.isValidating,
    stream.loadMore,
  ]);
  return { orders, stream, complete };
}
