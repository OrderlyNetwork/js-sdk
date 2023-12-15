import { OrderSide, OrderStatus } from "@orderly.network/types";

export const STATUS_OPTIONS = [
  {
    label: "All status",
    value: "",
  },
  {
    label: "Pending",
    value: OrderStatus.NEW,
  },
  {
    label: "Filled",
    value: OrderStatus.FILLED,
  },
  {
    label: "Partially filled",
    value: OrderStatus.PARTIAL_FILLED,
  },
  {
    label: "Cancelled",
    value: OrderStatus.CANCELLED,
  },
  {
    label: "Rejected",
    value: OrderStatus.REJECTED,
  },
];

export const SIDE_OPTIONS = [
  {
    label: "All sides",
    value: "",
  },
  {
    label: "Buy",
    value: OrderSide.BUY,
  },
  {
    label: "Sell",
    value: OrderSide.SELL,
  },
];
