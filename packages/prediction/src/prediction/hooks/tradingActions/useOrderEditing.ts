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
  const getOrderEditQuantityLimits = useCallback(
    (id: number) => {
      const order = openOrders.find((item) => item.id === id);
      const config = order?.symbol
        ? configBySymbol.get(order.symbol)
        : undefined;
      if (!order || !config) return undefined;
      const limits = resolveBinaryOrderLimits(config);
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
      const boundedMax = maxTotal.lt(0)
        ? new Decimal(0)
        : maxTotal.gt(limits.baseMax)
          ? new Decimal(limits.baseMax)
          : maxTotal;
      return {
        maxQuantity: boundedMax
          .div(limits.baseTick)
          .toDecimalPlaces(0, Decimal.ROUND_DOWN)
          .mul(limits.baseTick)
          .toNumber(),
        quantityTick: limits.baseTick,
        priceTick: limits.quoteTick,
      };
    },
    [openOrders, configBySymbol, availableQuantity, maxOpeningQuantity],
  );
  const editPendingOrder = useCallback(
    async (id: number, price: number, quantity: number): Promise<boolean> => {
      // Unlike the rejections below, this guard covers states with no live UI
      // left to notify (the modal is unmounting, or the session/instrument
      // context is already gone), so a silent false is correct here.
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
          reduceOnly: order.reduceOnly,
          requireQuantityTickAligned: true,
          checkQuantityMax: true,
        })
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      const remaining = new Decimal(quantity).sub(order.filledQuantity);
      // UI percentages and submission share the same total-quantity envelope.
      const quantityLimits = getOrderEditQuantityLimits(id);
      if (
        !quantityLimits ||
        remaining.lt(0) ||
        new Decimal(quantity).gt(quantityLimits.maxQuantity)
      ) {
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
        // The SDK execution report owns the successful edit notification.
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
      getOrderEditQuantityLimits,
      notify,
      openOrders,
      selectedConfig,
    ],
  );
  return { editPendingOrder, getOrderEditQuantityLimits };
};
