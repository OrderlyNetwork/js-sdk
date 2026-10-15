import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { unstable_serialize, useSWRConfig } from "swr";
import type { API } from "@orderly.network/types";
import { useWS } from "../useWS";

type BinaryFeePatch = Pick<
  API.AccountInfo,
  "binary_maker_fee_rate" | "binary_taker_fee_rate"
>;

type AccountFeeMessage = {
  accountDetail?: {
    binaryMakerFeeRate?: unknown;
    binaryTakerFeeRate?: unknown;
  };
};

const feeFields = [
  ["binaryMakerFeeRate", "binary_maker_fee_rate"],
  ["binaryTakerFeeRate", "binary_taker_fee_rate"],
] as const;

/** Merge private fee updates into the provider's complete, account-scoped snapshot. */
export function useBinaryAccountFeeSync(
  accountId: string | undefined,
  clientInfo: API.AccountInfo | undefined,
) {
  const ws = useWS();
  const { cache, mutate } = useSWRConfig();
  const scope = useMemo(
    () => ({ accountId, cache, ws }),
    [accountId, cache, ws],
  );
  const currentSession = useRef<{
    scope: typeof scope;
    pending: BinaryFeePatch;
  }>();

  const flush = useCallback(() => {
    const session = currentSession.current;
    if (
      !accountId ||
      !session ||
      session.scope !== scope ||
      Object.keys(session.pending).length === 0
    )
      return;
    const key = ["/v1/client/info", accountId];
    const snapshot = cache.get(unstable_serialize(key))?.data as
      | API.AccountInfo
      | undefined;
    // Mutating an empty SWR cache would discard the initial in-flight REST
    // request. Retain the patch until a complete account snapshot arrives.
    if (snapshot?.account_id !== accountId) return;
    const patch = session.pending;
    session.pending = {};
    void mutate<API.AccountInfo>(
      key,
      (previous) => {
        if (
          !previous ||
          currentSession.current !== session ||
          previous.account_id !== accountId
        )
          return previous;
        return { ...previous, ...patch };
      },
      { revalidate: false },
    ).catch(() => undefined);
  }, [accountId, cache, mutate, scope]);

  useLayoutEffect(() => {
    if (!accountId) return;
    const session = { scope, pending: {} as BinaryFeePatch };
    currentSession.current = session;
    const onStatus = (event: {
      type: string;
      isPrivate: boolean;
      isReconnect?: boolean;
    }) => {
      if (
        currentSession.current === session &&
        event.isPrivate &&
        event.type === "open" &&
        event.isReconnect
      ) {
        // A new snapshot recovers changes missed while disconnected. Any
        // later fee message mutates the cache and supersedes this request.
        session.pending = {};
        void mutate(["/v1/client/info", accountId]).catch(() => undefined);
      }
    };
    ws.on("status:change", onStatus);
    return () => {
      if (currentSession.current === session)
        currentSession.current = undefined;
      ws.off("status:change", onStatus);
    };
  }, [accountId, mutate, scope, ws]);

  useEffect(() => {
    flush();
  }, [clientInfo, flush]);

  return useCallback(
    (message: AccountFeeMessage) => {
      const session = currentSession.current;
      if (!session || session.scope !== scope) return;
      const detail = message?.accountDetail;
      if (!detail || typeof detail !== "object") return;
      for (const [source, target] of feeFields) {
        if (!Object.prototype.hasOwnProperty.call(detail, source)) continue;
        const value = detail[source];
        session.pending[target] =
          typeof value === "number" && Number.isFinite(value) && value >= 0
            ? value
            : undefined;
      }
      flush();
    },
    [flush, scope],
  );
}
