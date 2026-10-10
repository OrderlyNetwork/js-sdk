import {
  useCallback,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
} from "react";
import { useMutation } from "@orderly.network/hooks";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import {
  isBinaryRowTradable,
  type BinaryInfoRow,
} from "../../binary/binaryInfo";
import { binaryOrderEditPayload } from "../../binary/binaryOrderDisplay";
import {
  binaryRejectionNotice,
  complementPrice,
  resolveBinaryOrderLimits,
  validateBinaryOrderSize,
} from "../../binary/binaryOrderRules";
import type { PredictionAccountResources } from "../usePredictionAccountResources";
import type { AccountEstimates } from "./useAccountEstimates";

interface OrderEditingArgs {
  resources: PredictionAccountResources;
  active: boolean;
  mounted: MutableRefObject<boolean>;
  configBySymbol: Map<string, BinaryInfoRow>;
  selectedSymbol?: string;
  isRegionRestricted: boolean;
  notify: (message: string, tone?: "success" | "danger") => void;
  availableQuantity: AccountEstimates["availableQuantity"];
  maxOpeningQuantity: AccountEstimates["maxOpeningQuantity"];
}
const rejectionNotice = binaryRejectionNotice;
export const useOrderEditing = ({
  resources,
  active,
  mounted,
  configBySymbol,
  selectedSymbol,
  isRegionRestricted,
  notify,
  availableQuantity,
  maxOpeningQuantity,
}: OrderEditingArgs) => {
  const { openOrders, accountState, accountReady } = resources;
  const context = useRef({
    accountId: accountState.accountId,
    active,
    revision: 0,
  });
  useLayoutEffect(() => {
    if (
      context.current.accountId !== accountState.accountId ||
      context.current.active !== active
    ) {
      context.current = {
        accountId: accountState.accountId,
        active,
        revision: context.current.revision + 1,
      };
    }
  }, [accountState.accountId, active]);
  const selectedConfig = selectedSymbol
    ? configBySymbol.get(selectedSymbol)
    : undefined;
  const [doUpdateOrder] = useMutation("/v1/order", "PUT");
  const editPendingOrder = useCallback(
    async (id: number, price: number, quantity: number): Promise<boolean> => {
      if (
        !active ||
        !accountReady ||
        !accountState.accountId ||
        !mounted.current
      )
        return false;
      const revision = context.current.revision;
      const isCurrent = () =>
        mounted.current && context.current.revision === revision;
      const order = openOrders.find((item) => item.id === id);
      const config = order?.symbol
        ? configBySymbol.get(order.symbol)
        : selectedConfig;
      // Every rejection must surface a reason; a silently no-oping edit
      // modal looks like a broken button.
      if (!config || !isBinaryRowTradable(config, getTimestamp())) {
        notify("prediction.message.roundNotTradable", "danger");
        return false;
      }
      if (isRegionRestricted) {
        notify("prediction.message.regionRestricted", "danger");
        return false;
      }
      if (!order) {
        notify("prediction.message.orderNotFound", "danger");
        return false;
      }
      const limits = resolveBinaryOrderLimits(config);
      if (
        validateBinaryOrderSize({
          price,
          quantity,
          limits,
          requireQuantityTickAligned: true,
          checkQuantityMax: true,
        })
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      const remaining = new Decimal(quantity).sub(order.filledQuantity);
      // PERP-style quantity envelope only; backend checks repricing funds.
      const maxTotal = order.reduceOnly
        ? new Decimal(order.filledQuantity).add(
            availableQuantity(
              order.side === "sell" ? "up" : "down",
              id,
              order.symbol,
            ),
          )
        : new Decimal(order.quantity).add(
            maxOpeningQuantity(
              order.outcome,
              order.outcome === "up"
                ? order.price
                : complementPrice(order.price),
              order.symbol,
            ),
          );
      if (remaining.lt(0) || new Decimal(quantity).gt(maxTotal)) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      try {
        const payload = binaryOrderEditPayload(
          order,
          price,
          quantity,
          limits.quoteTick,
          limits.baseTick,
        );
        if (!payload) {
          notify("prediction.message.orderNotFound", "danger");
          return false;
        }
        const response = await doUpdateOrder(payload);
        if (!isCurrent()) return false;
        if (response?.success === false) {
          // Empty message falls through to the generic key in rejectionNotice.
          throw new Error(response?.message);
        }
        notify("prediction.message.orderUpdated");
        return true;
      } catch (error) {
        if (!isCurrent()) return false;
        console.error("prediction order update rejected", error);
        notify(rejectionNotice(error), "danger");
        return false;
      }
    },
    [
      active,
      accountReady,
      accountState.accountId,
      mounted,
      configBySymbol,
      doUpdateOrder,
      isRegionRestricted,
      availableQuantity,
      maxOpeningQuantity,
      notify,
      openOrders,
      selectedConfig,
    ],
  );
  return { editPendingOrder };
};
