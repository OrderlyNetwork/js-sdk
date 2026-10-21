import { API, OrderType } from "@orderly.network/types";
import { getTPSLLeg, isConfiguredPendingTPSLLeg } from "@orderly.network/utils";
import {
  getTPSLEditableOrderValues,
  TPSLEditableOrderValues,
} from "../positionTPSL/tpslOrderSync";

export type BracketTPSLPriceInfo = Omit<TPSLEditableOrderValues, "quantity">;

const priceKeys = [
  "tp_trigger_price",
  "tp_order_price",
  "sl_trigger_price",
  "sl_order_price",
] as const satisfies readonly (keyof BracketTPSLPriceInfo)[];

const normalizePrice = (value: number | string | null | undefined) => {
  if (value === undefined || value === null || value === "") return "";
  const number = Number(value);
  return Number.isFinite(number) ? number : String(value);
};

export function getBracketTPSLPriceInfo(
  order: API.AlgoOrder,
  ancestor?: API.AlgoOrder,
): BracketTPSLPriceInfo {
  const { quantity: _, ...priceInfo } = getTPSLEditableOrderValues(order);
  // Pending Bracket protection is configured before activation. Its prices
  // are still editable, unlike stale prices on an inactive position placeholder.
  for (const leg of ["tp", "sl"] as const) {
    const child = getTPSLLeg(order, leg);
    if (!child || !isConfiguredPendingTPSLLeg(order, child, ancestor)) {
      continue;
    }
    priceInfo[`${leg}_trigger_price`] = child.trigger_price!.toString();
    priceInfo[`${leg}_order_price`] =
      priceInfo[`${leg}_order_type`] === OrderType.LIMIT
        ? (child.price?.toString() ?? "")
        : "";
  }
  return priceInfo;
}

export function hasBracketTPSLPriceChanged(
  initial: BracketTPSLPriceInfo,
  current: Partial<BracketTPSLPriceInfo>,
): boolean {
  return priceKeys.some(
    (key) => normalizePrice(initial[key]) !== normalizePrice(current[key]),
  );
}
