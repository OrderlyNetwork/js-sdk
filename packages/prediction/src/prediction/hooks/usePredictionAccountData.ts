import { type LocaleMessages, i18n } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { useBinaryRegionRestricted } from "../binary/useBinaryRegion";
import type {
  PredictionAccountState,
  UsePredictionAccountDataOptions,
} from "../prediction.types";
import { usePredictionAccountActions } from "./usePredictionAccountActions";
import { usePredictionAccountResources } from "./usePredictionAccountResources";
import { usePredictionMarkets } from "./usePredictionMarkets";

const notify = (message: string, tone: "success" | "danger" = "success") =>
  tone === "success"
    ? toast.success(String(i18n.t(message as keyof LocaleMessages)))
    : toast.error(String(i18n.t(message as keyof LocaleMessages)));
/** Account panels share SDK streams and bound query mutations, without page state or market subscriptions. */
export const usePredictionAccountData = ({
  enabled = true,
  includeOrderHistory = false,
  includeSettlementHistory = false,
}: UsePredictionAccountDataOptions = {}): PredictionAccountState => {
  const markets = usePredictionMarkets({ enabled });
  const resources = usePredictionAccountResources({
    enabled,
    includeOrderHistory,
    includeSettlementHistory,
    nowMs: markets.now,
  });
  const isRegionRestricted = useBinaryRegionRestricted(enabled);
  const actions = usePredictionAccountActions({
    resources,
    binaryRows: markets.rows,
    active: enabled,
    isRegionRestricted,
    notify,
  });
  return {
    accountId:
      enabled && resources.accountReady
        ? resources.accountState.accountId
        : undefined,
    accountReady: enabled && resources.accountReady,
    ordersLoading: resources.ordersLoading,
    ordersError: resources.ordersError,
    positionsLoading: resources.positionsLoading,
    positionsError: resources.positionsError,
    balance: resources.balance,
    positions: resources.positions,
    openOrders: resources.openOrders,
    pendingOrdersComplete: resources.pendingOrdersComplete,
    history: resources.history,
    settlements: resources.settlements,
    historyRecords: resources.historyRecords,
    historyLoading: resources.historyLoading,
    historyError: resources.historyError,
    pendingSettlementSymbols: resources.pendingSettlementSymbols,
    ...actions.actions,
    hasFeeConfig: actions.hasFeeConfig,
    isSubmitting: false,
    feeRates: actions.feeRates,
    isRegionRestricted,
  };
};
