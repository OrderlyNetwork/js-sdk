import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useMemoizedFn,
  useMutation,
  usePrivateInfiniteQuery,
  useRefreshOrderCaches,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useCanTrade } from "@orderly.network/react-app";
import { OrderStatus, type API } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { useCancelAllConfirmation } from "@orderly.network/ui-orders";
import { formatSymbol } from "@orderly.network/utils";
import type { PredictionState } from "../prediction.script";
import {
  cancelProductTargets,
  cancellationOrdersSnapshot,
  productCancellationTargets,
  type ProductOrderInstrument,
} from "./productOrderCancellation";

type CancellationState = Pick<PredictionState, "openOrders" | "pendingOrdersComplete"> & {
  accountId?: string;
  accountReady: boolean;
  isRegionRestricted: boolean;
  isOrderTradable: (symbol?: string) => boolean;
};

export type ProductOrderCancelAllOptions = {
  state: CancellationState | null;
  enabled?: boolean;
  instrument?: ProductOrderInstrument;
  perpsSymbol?: string;
  /** Underlying PERP symbol, for example PERP_BTC_USDC. */
  predictionUnderlyingSymbol?: string;
};
export type ProductOrderCancelAllState = {
  /** Execute without a confirmation; unavailable during native PERP fallback. */
  cancelAll?: () => Promise<boolean>;
  /** Confirm the product scope before executing. */
  onCancelAll?: () => Promise<boolean>;
  disabled?: boolean;
  isCancelling: boolean;
  /** Spread after the standard OrderList state; empty during native fallback. */
  orderListProps: {
    onCancelAll?: () => Promise<boolean>;
    cancelAllDisabled?: boolean;
  };
};

export function useProductOrderCancelAll(
  options: ProductOrderCancelAllOptions,
): ProductOrderCancelAllState;
/** @deprecated Use the options object to select All, Perps or Prediction explicitly. */
export function useProductOrderCancelAll(
  state: CancellationState | null,
  enabled: boolean,
  includePrediction: boolean,
  perpsSymbol?: string,
): ProductOrderCancelAllState;
/** Account-wide pending cancellation, independent of display filters. */
export function useProductOrderCancelAll(
  optionsOrState: ProductOrderCancelAllOptions | CancellationState | null,
  legacyEnabled?: boolean,
  legacyIncludePrediction?: boolean,
  legacyPerpsSymbol?: string,
): ProductOrderCancelAllState {
  const options: ProductOrderCancelAllOptions =
    optionsOrState && "state" in optionsOrState
      ? (optionsOrState as ProductOrderCancelAllOptions)
      : {
          state: optionsOrState as CancellationState | null,
          enabled: legacyEnabled,
          instrument: legacyIncludePrediction ? "all" : "perps",
          perpsSymbol: legacyPerpsSymbol,
        };
  const {
    state,
    enabled = true,
    instrument = "all",
    perpsSymbol,
    predictionUnderlyingSymbol,
  } = options;
  const { state: account } = useAccount();
  const canTrade = useCanTrade();
  const { t } = useTranslation();
  const refreshOrders = useRefreshOrderCaches();
  const includePerps = instrument !== "prediction";
  const includePrediction = instrument !== "perps";
  const nativeFallback = state === null && includePerps;
  const queryEnabled = enabled && !!state && includePerps;
  const pending = usePrivateInfiniteQuery<API.OrderResponse>(
    queryEnabled
      ? (index: number, previous?: API.OrderResponse) => {
          if (previous && !previous.rows.length) return null;
          const params = new URLSearchParams({
            product_type: "PERP",
            source_type: "ALL",
            status: OrderStatus.INCOMPLETE,
            size: "100",
            page: String(index + 1),
          });
          if (perpsSymbol) params.set("symbol", perpsSymbol);
          return `/v1/orders?${params}`;
        }
      : null,
    {
      formatter: (data) => data,
      keepPreviousData: false,
      revalidateOnFocus: true,
      refreshInterval: queryEnabled ? 15000 : 0,
    },
  );
  const snapshot = useMemo(
    () => cancellationOrdersSnapshot(pending.data),
    [pending.data],
  );
  const complete =
    snapshot.complete &&
    !pending.error &&
    !pending.isLoading &&
    !pending.isValidating;
  useEffect(() => {
    if (
      queryEnabled &&
      snapshot.total != null &&
      snapshot.orders.length < snapshot.total &&
      !pending.error &&
      !pending.isValidating &&
      pending.data?.at(-1)?.rows.length
    ) {
      void pending.setSize((size) => size + 1);
    }
  }, [
    queryEnabled,
    snapshot.total,
    snapshot.orders.length,
    pending.error,
    pending.isValidating,
    pending.data,
    pending.setSize,
  ]);
  const scopeKey = JSON.stringify([
    instrument,
    perpsSymbol,
    predictionUnderlyingSymbol,
    !!state,
  ]);
  const context = useRef({
    accountId: account.accountId,
    scopeKey,
    revision: 0,
  });
  if (
    context.current.accountId !== account.accountId ||
    context.current.scopeKey !== scopeKey
  ) {
    context.current = {
      accountId: account.accountId,
      scopeKey,
      revision: context.current.revision + 1,
    };
  }
  const getTargets = useMemoizedFn(
    (orders = snapshot.orders, ready = complete) =>
      enabled &&
      canTrade &&
      account.accountId &&
      state?.accountReady &&
      state.accountId === account.accountId
        ? productCancellationTargets({
            perps: orders,
            perpsComplete: ready,
            includePerps,
            perpsSymbol,
            binary: state.openOrders,
            binaryComplete: state.pendingOrdersComplete,
            includePrediction,
            predictionUnderlyingSymbol,
            regionRestricted: state.isRegionRestricted,
            isBinaryTradable: state.isOrderTradable,
          })
        : undefined,
  );
  const [cancelOrders] = useMutation("/v1/orders", "DELETE");
  const [cancelAlgoOrders] = useMutation("/v1/algo/orders", "DELETE");
  const [isCancelling, setIsCancelling] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const currentAccount = useMemoizedFn(() => account.accountId);
  const cancelAll = useMemoizedFn(async (): Promise<boolean> => {
    if (busy.current || !mounted.current || !getTargets()?.length) return false;
    const accountId = currentAccount();
    const revision = context.current.revision;
    const isCurrent = () =>
      mounted.current && context.current.revision === revision;
    busy.current = true;
    setIsCancelling(true);
    try {
      const refreshed = includePerps
        ? cancellationOrdersSnapshot(await pending.mutate())
        : snapshot;
      const success = await cancelProductTargets(
        () =>
          isCurrent()
            ? getTargets(
                refreshed.orders,
                includePerps ? refreshed.complete : true,
              )
            : undefined,
        (symbol) => cancelOrders(null, { symbol }),
        (symbol, algo_type) => cancelAlgoOrders(null, { symbol, algo_type }),
      );
      if (!success || !isCurrent()) return false;
      toast.success(t("prediction.message.ordersCanceled"));
      return true;
    } catch (error) {
      if (isCurrent())
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : t("orders.cancelAll.failed"),
        );
      return false;
    } finally {
      // Never revalidate an old account's keys using the new account's signer.
      if (currentAccount() === accountId) {
        await Promise.resolve()
          .then(() => refreshOrders(accountId))
          .catch(() => undefined);
      }
      busy.current = false;
      if (mounted.current) setIsCancelling(false);
    }
  });
  const blocked = !getTargets()?.length;
  const product = instrument === "prediction" ? "binary" : instrument;
  const scopes: string[] = [];
  if (includePerps)
    scopes.push(
      `${t("common.perps")}: ${perpsSymbol ? formatSymbol(perpsSymbol, "base") : t("common.all")}`,
    );
  if (includePrediction)
    scopes.push(
      `${t("prediction.title")}: ${predictionUnderlyingSymbol ? formatSymbol(predictionUnderlyingSymbol, "base") : t("common.all")}`,
    );
  const content =
    perpsSymbol || predictionUnderlyingSymbol
      ? t("prediction.cancelAll.scoped.description", {
          scope: scopes.join("; "),
        })
      : t(`prediction.cancelAll.${product}.description`);
  const confirmation = useCancelAllConfirmation({
    scopeKey,
    disabled: blocked || isCancelling || nativeFallback,
    title: t("orders.pending.cancelAll"),
    content,
    execute: cancelAll,
  });
  const disabled = blocked || isCancelling || confirmation.isConfirming;
  const fallbackDisabled = !enabled || !canTrade ? true : undefined;
  return {
    cancelAll: nativeFallback ? undefined : cancelAll,
    onCancelAll: nativeFallback ? undefined : confirmation.onCancelAll,
    disabled: nativeFallback ? fallbackDisabled : disabled,
    isCancelling,
    orderListProps: nativeFallback
      ? fallbackDisabled
        ? { cancelAllDisabled: true }
        : {}
      : { onCancelAll: confirmation.onCancelAll, cancelAllDisabled: disabled },
  };
}
