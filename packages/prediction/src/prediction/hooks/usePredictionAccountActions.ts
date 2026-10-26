import { useMemo, useRef } from "react";
import { useRefreshOrderCaches } from "@orderly.network/hooks";
import type { BinaryInfoRow } from "../binary/binaryInfo";
import { useBinaryFeeRates } from "../binary/useBinaryFeeRates";
import type { PredictionAccountActions } from "../prediction.types";
import { useAccountEstimates } from "./tradingActions/useAccountEstimates";
import { useOrderCancellation } from "./tradingActions/useOrderCancellation";
import { useOrderEditing } from "./tradingActions/useOrderEditing";
import type { PredictionAccountResources } from "./usePredictionAccountResources";

interface AccountActionsArgs {
  resources: PredictionAccountResources;
  binaryRows: BinaryInfoRow[];
  active: boolean;
  selectedSymbol?: string;
  isRegionRestricted: boolean;
  notify: (message: string, tone?: "success" | "danger") => void;
}
/** Account commands do not initialize a book, submission engine or one-tap orders. */
export const usePredictionAccountActions = ({
  resources,
  binaryRows,
  active,
  selectedSymbol,
  isRegionRestricted,
  notify,
}: AccountActionsArgs) => {
  const configBySymbol = useMemo(
    () => new Map(binaryRows.map((row) => [row.symbol, row])),
    [binaryRows],
  );
  const feeRates = useBinaryFeeRates(resources.feeRates);
  const hasFeeConfig = feeRates.takerRate != null && feeRates.makerRate != null;
  const bulkCancellationMounted = useRef(true);
  const refreshCurrentOrders = useRefreshOrderCaches();
  const refreshOrders = resources.refreshOrders ?? refreshCurrentOrders;
  const estimates = useAccountEstimates({
    resources,
    active,
    configBySymbol,
    selectedSymbol,
    feeRates,
    hasFeeConfig,
  });
  const cancellation = useOrderCancellation({
    resources,
    notify,
    isRegionRestricted,
    isOrderTradable: estimates.isOrderTradable,
    refreshOrders,
    bulkCancellationMounted,
  });
  const editing = useOrderEditing({
    resources,
    active,
    mounted: bulkCancellationMounted,
    configBySymbol,
    selectedSymbol,
    isRegionRestricted,
    notify,
    availableQuantity: estimates.availableQuantity,
    maxOpeningQuantity: estimates.maxOpeningQuantity,
  });
  const actions: PredictionAccountActions = {
    availableQuantity: estimates.availableQuantity,
    isOrderTradable: estimates.isOrderTradable,
    estimateFee: estimates.estimateFee,
    cancelOrder: resources.targetAccountId
      ? async () => {}
      : cancellation.cancelOrder,
    cancelAllOrders: resources.targetAccountId
      ? async () => false
      : cancellation.cancelAllOrders,
    editPendingOrder: resources.targetAccountId
      ? async () => false
      : editing.editPendingOrder,
    getOrderEditQuantityLimits: editing.getOrderEditQuantityLimits,
  };
  return {
    actions,
    estimates,
    feeRates,
    hasFeeConfig,
    configBySymbol,
    refreshOrders,
    bulkCancellationMounted,
  };
};
