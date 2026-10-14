import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
} from "react";
import {
  useMemoizedFn,
  useMutation,
  type useRefreshOrderCaches,
} from "@orderly.network/hooks";
import { i18n } from "@orderly.network/i18n";
import { binaryRejectionNotice } from "../../binary/binaryOrderRules";
import {
  cancelProductTargets,
  productCancellationTargets,
  type BinaryCancelAllOptions,
} from "../../dataPanels/productOrderCancellation";
import type { PredictionAccountResources } from "../usePredictionAccountResources";
import type { TradingEstimates } from "./useTradingEstimates";

export type OrderCancellationArgs = {
  resources: PredictionAccountResources;
  notify: (message: string, tone?: "success" | "danger") => void;
  isRegionRestricted: boolean;
  isOrderTradable: TradingEstimates["isOrderTradable"];
  refreshOrders: ReturnType<typeof useRefreshOrderCaches>;
  /** Shared unmount guard; false stops async continuations mid-flight. */
  bulkCancellationMounted: MutableRefObject<boolean>;
};

// The UI renders notification messages through i18next `t()`, which passes
// unknown keys through verbatim, so raw backend rejection text displays as-is
// (untranslated); only messages without any backend text fall back to the key.
const rejectionNotice = binaryRejectionNotice;

export const useOrderCancellation = ({
  resources,
  notify,
  isRegionRestricted,
  isOrderTradable,
  refreshOrders,
  bulkCancellationMounted,
}: OrderCancellationArgs) => {
  const { accountState, accountReady, openOrders, pendingOrdersComplete } =
    resources;
  const [doCancelOrder] = useMutation("/v1/order", "DELETE");
  const [doCancelAllOrders] = useMutation("/v1/orders", "DELETE");
  const cancelOrder = useCallback(
    async (id: number, orderSymbol?: string) => {
      // Region gating is already reflected by the disabled cancel button;
      // the remaining paths only fire on click/render races, so say why.
      if (isRegionRestricted) return;
      const order = openOrders.find((item) => item.id === id);
      const symbol = orderSymbol ?? order?.symbol;
      if (!symbol) {
        notify(i18n.t("prediction.message.orderNotFound"), "danger");
        return;
      }
      if (!isOrderTradable(symbol)) {
        notify("prediction.message.roundNotTradable", "danger");
        return;
      }
      try {
        const response = await doCancelOrder(null, {
          order_id: id,
          symbol,
        });
        if (response?.success === false) {
          // Empty message falls through to the generic key in rejectionNotice.
          throw new Error(response?.message);
        }
        // The SDK execution report owns the successful cancellation notification.
      } catch (error) {
        console.error("prediction cancel rejected", error);
        notify(rejectionNotice(error), "danger");
      }
    },
    [doCancelOrder, isOrderTradable, isRegionRestricted, notify, openOrders],
  );
  const bulkCancellationBusy = useRef(false);
  const bulkCancellationContext = useRef({
    accountId: accountState.accountId,
    revision: 0,
  });
  useLayoutEffect(() => {
    if (bulkCancellationContext.current.accountId !== accountState.accountId) {
      bulkCancellationContext.current = {
        accountId: accountState.accountId,
        revision: bulkCancellationContext.current.revision + 1,
      };
    }
  }, [accountState.accountId]);
  useEffect(() => {
    bulkCancellationMounted.current = true;
    return () => {
      bulkCancellationMounted.current = false;
    };
  }, []);
  const cancellationContext = useMemoizedFn(() => ({
    accountId: accountState.accountId,
    accountReady,
    openOrders,
    pendingOrdersComplete,
    isRegionRestricted,
    isOrderTradable,
  }));
  const cancelAllOrders = useMemoizedFn(
    async (options: BinaryCancelAllOptions = {}): Promise<boolean> => {
      const initial = cancellationContext();
      if (
        bulkCancellationBusy.current ||
        !bulkCancellationMounted.current ||
        !initial.accountReady ||
        !initial.accountId
      )
        return false;
      const revision = bulkCancellationContext.current.revision;
      const isCurrent = () =>
        bulkCancellationMounted.current &&
        bulkCancellationContext.current.revision === revision;
      const getTargets = () => {
        const current = cancellationContext();
        return isCurrent() &&
          current.accountReady &&
          current.accountId === initial.accountId
          ? productCancellationTargets({
              perps: [],
              perpsComplete: true,
              includePerps: false,
              binary: current.openOrders,
              binaryComplete: current.pendingOrdersComplete,
              includePrediction: true,
              predictionUnderlyingSymbol: options.underlyingSymbol,
              regionRestricted: current.isRegionRestricted,
              isBinaryTradable: current.isOrderTradable,
            })
          : undefined;
      };
      if (!getTargets()?.length) return false;
      bulkCancellationBusy.current = true;
      try {
        const success = await cancelProductTargets(
          getTargets,
          (symbol) => doCancelAllOrders(null, { symbol }),
          async () => undefined,
        );
        if (!success || !isCurrent()) return false;
        // Successful cancellations are reported by the SDK execution stream.
        return true;
      } catch (error) {
        if (isCurrent()) {
          console.error("prediction cancel-all partially rejected", error);
          notify(rejectionNotice(error), "danger");
        }
        return false;
      } finally {
        if (cancellationContext().accountId === initial.accountId) {
          await Promise.resolve()
            .then(() => refreshOrders(initial.accountId))
            .catch(() => undefined);
        }
        bulkCancellationBusy.current = false;
      }
    },
  );
  return {
    cancelOrder,
    cancelAllOrders,
  };
};

export type OrderCancellation = ReturnType<typeof useOrderCancellation>;
