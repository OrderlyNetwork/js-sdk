import { pathOr } from "ramda";

export const totalUnsettlementPnLPath = pathOr(0, [
  0,
  "aggregated",
  "unsettledPnL",
]);
