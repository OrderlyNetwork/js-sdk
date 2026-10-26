/** A fulfilled HTTP request may still contain a backend cancellation failure. */
export function assertCancelAllSucceeded(response: unknown): void {
  if (Array.isArray(response)) {
    response.forEach(assertCancelAllSucceeded);
    return;
  }
  const envelope = response as { success?: boolean; message?: string } | null;
  if (envelope?.success === false) {
    throw new Error(envelope.message || "Order cancellation failed.");
  }
}

/** Await every submitted cancellation before reporting a partial failure. */
export async function settleOrderCancellations<T>(
  requests: Promise<T>[],
): Promise<T[]> {
  const results = await Promise.allSettled(requests);
  return results.map((result) => {
    if (result.status === "rejected") throw result.reason;
    assertCancelAllSucceeded(result.value);
    return result.value;
  });
}
