import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useAccount, usePrivateQuery } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { AccountType } from "@orderly.network/ui-assets";
import { Decimal } from "@orderly.network/utils";
import { mergeManagedPredictionPositions } from "../../binary/binaryManagedPositions";
import type {
  PredictionAccountPanelState,
  PredictionPosition,
} from "../../prediction.types";

export function useManagedPositionsScript(
  state: PredictionAccountPanelState,
  selectedAccount: string,
) {
  const { state: login, account, isMainAccount } = useAccount();
  const subAccounts = login.subAccounts ?? [];
  const enabled = isMainAccount && state.accountReady;
  const aggregate = usePrivateQuery<API.PositionExt[]>(
    enabled ? "/v1/client/aggregate/positions" : null,
    {
      errorRetryCount: 3,
      keepPreviousData: false,
    },
  );
  const positions = useMemo(
    () =>
      mergeManagedPredictionPositions(
        state.positions,
        enabled ? aggregate.data : undefined,
        login.accountId,
        isMainAccount ? subAccounts.map((account) => account.id) : [],
      ),
    [
      state.positions,
      aggregate.data,
      enabled,
      login.accountId,
      isMainAccount,
      subAccounts,
    ],
  );
  const filtered = positions.filter(
    (position) =>
      !isMainAccount ||
      selectedAccount === AccountType.ALL ||
      position.accountId ===
        (selectedAccount === AccountType.MAIN
          ? login.accountId
          : selectedAccount),
  );
  const getPositionState = useCallback(
    (position: PredictionPosition): PredictionAccountPanelState => {
      if (position.accountId === login.accountId) return state;
      const row = aggregate.data?.find(
        (row) =>
          row.account_id === position.accountId &&
          row.symbol === position.symbol,
      );
      return {
        ...state,
        positions: [position],
        accountReady:
          state.accountReady &&
          !aggregate.error &&
          subAccounts.some((account) => account.id === position.accountId),
        availableQuantity: () => {
          if (
            !row ||
            !Number.isFinite(row.pending_long_qty) ||
            !Number.isFinite(row.pending_short_qty)
          )
            return 0;
          const reserved = new Decimal(
            position.outcome === "up"
              ? row.pending_short_qty
              : row.pending_long_qty,
          ).abs();
          const available = new Decimal(position.quantity).sub(reserved);
          return available.gt(0) ? available.toNumber() : 0;
        },
      };
    },
    [state, login.accountId, aggregate.data, aggregate.error, subAccounts],
  );
  const alive = useRef(false);
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, [login.accountId]);
  const onSubmitted = useCallback(async () => {
    if (alive.current && enabled && account.accountId === login.accountId)
      await aggregate.mutate();
  }, [enabled, aggregate.mutate, account, login.accountId]);
  return {
    state: { ...state, positions: filtered },
    getPositionState,
    subAccounts,
    mainAccountId: login.accountId,
    grouped: isMainAccount,
    onSubmitted,
    error: enabled ? aggregate.error : undefined,
    loading: state.positionsLoading || (enabled && aggregate.isLoading),
    retry: () => aggregate.mutate(),
  };
}
