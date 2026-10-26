import { useCallback, useLayoutEffect, useRef } from "react";
import {
  useAccount,
  useMarkPricesStream,
  useSubAccountMutation,
  useSubAccountQuery,
} from "@orderly.network/hooks";
import { AccountStatusEnum, OrderSide, type API } from "@orderly.network/types";
import {
  availableBinaryCloseQuantity,
  resolveBinaryCollateral,
} from "../binary/binaryCollateral";
import { isBinarySymbol } from "../binary/binaryInfo";
import {
  loadBinaryPendingSnapshot,
  toPredictionPosition,
  type BinaryPendingSnapshot,
} from "../binary/binaryManagedPositions";
import { filterPredictionOrders } from "../binary/binaryOrderDisplay";
import { binaryFeeRates } from "../binary/useBinaryFeeRates";
import type { PredictionOutcome } from "../prediction.types";

const pendingUrl = (page: number) =>
  `/v1/orders?status=INCOMPLETE&product_type=BINARY&size=100&page=${page}`;

/** Only mounted by the lazy close popover; never opens a child private stream. */
export function usePredictionTargetResources(
  targetAccountId: string | undefined,
  enabled: boolean,
) {
  const { state, account, isMainAccount } = useAccount();
  const owner = useRef(state.accountId);
  const openingTarget = useRef(targetAccountId);
  const allowed =
    !!targetAccountId &&
    targetAccountId === openingTarget.current &&
    isMainAccount &&
    owner.current === state.accountId &&
    !!state.subAccounts?.some((account) => account.id === targetAccountId) &&
    (state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected);
  const liveAllowed = useRef(false);
  const revoked = useRef(false);
  const activated = useRef(false);
  useLayoutEffect(() => {
    if (activated.current && (!enabled || !allowed)) revoked.current = true;
    liveAllowed.current = enabled && allowed && !revoked.current;
    if (liveAllowed.current) activated.current = true;
    return () => {
      liveAllowed.current = false;
    };
  }, [allowed, enabled]);
  const canSubmit = useCallback(
    () =>
      liveAllowed.current &&
      account.accountId === owner.current &&
      (account.stateValue.status >= AccountStatusEnum.EnableTrading ||
        account.stateValue.status ===
          AccountStatusEnum.EnableTradingWithoutConnected) &&
      !!account.stateValue.subAccounts?.some(
        (child) => child.id === openingTarget.current,
      ),
    [account],
  );
  const queryAccount =
    enabled && allowed && !revoked.current ? targetAccountId : undefined;
  const [getOrdersPage] = useSubAccountMutation("/v1/orders", "GET", {
    accountId: targetAccountId,
    shouldExecute: canSubmit,
  });
  const formatter = useCallback(
    async (first: BinaryPendingSnapshot) => {
      if (!canSubmit())
        throw new Error("Target account is no longer available");
      const data = await loadBinaryPendingSnapshot(first, async (page) => {
        if (!canSubmit())
          throw new Error("Target account is no longer available");
        const response = await getOrdersPage(null, {
          status: "INCOMPLETE",
          product_type: "BINARY",
          size: 100,
          page,
        });
        if (!response?.success || !canSubmit())
          throw new Error(response?.message || "Unable to load target orders");
        return response.data;
      });
      if (!canSubmit())
        throw new Error("Target account is no longer available");
      return data;
    },
    [canSubmit, getOrdersPage],
  );
  const positions = useSubAccountQuery<API.PositionInfo>("/v1/positions", {
    accountId: queryAccount,
    formatter: (data) => data,
    keepPreviousData: false,
  });
  const orders = useSubAccountQuery<BinaryPendingSnapshot>(pendingUrl(1), {
    accountId: queryAccount,
    formatter,
    keepPreviousData: false,
  });
  const info = useSubAccountQuery<API.AccountInfo>("/v1/client/info", {
    accountId: queryAccount,
    keepPreviousData: false,
  });
  const { data: markPrices } = useMarkPricesStream();
  const snapshot = useRef({
    positions: positions.data,
    orders: orders.data,
    info: info.data,
  });
  useLayoutEffect(() => {
    snapshot.current = {
      positions: positions.data,
      orders: orders.data,
      info: info.data,
    };
  }, [positions.data, orders.data, info.data]);
  const errors = positions.error || orders.error || info.error;
  const complete =
    !!orders.data &&
    Array.isArray(orders.data.rows) &&
    Number.isInteger(orders.data.meta?.total) &&
    orders.data.meta.total >= 0 &&
    orders.data.rows.length >= orders.data.meta.total &&
    !orders.error;
  const ready =
    enabled &&
    allowed &&
    !revoked.current &&
    Array.isArray(positions.data?.rows) &&
    complete &&
    !!info.data &&
    !errors;
  const getCollateralSnapshot = useCallback(
    (symbol?: string) => {
      if (!canSubmit()) return undefined;
      return resolveBinaryCollateral({
        symbol,
        positions: snapshot.current.positions?.rows,
        orders: snapshot.current.orders?.rows,
        ordersComplete: !!snapshot.current.orders,
        markPrice: symbol ? markPrices?.[symbol] : undefined,
      });
    },
    [canSubmit, markPrices],
  );
  const availableQuantity = useCallback(
    (outcome: PredictionOutcome, excludeId?: number, symbol?: string) =>
      availableBinaryCloseQuantity(
        getCollateralSnapshot(symbol),
        outcome === "up" ? OrderSide.SELL : OrderSide.BUY,
        excludeId,
      ),
    [getCollateralSnapshot],
  );
  const refreshForSubmission = useCallback(async () => {
    if (!canSubmit()) throw new Error("Target account is no longer available");
    const [freshPositions, freshOrders, freshInfo] = await Promise.all([
      positions.mutate(),
      orders.mutate(),
      info.mutate(),
    ]);
    if (
      !canSubmit() ||
      !Array.isArray(freshPositions?.rows) ||
      !Array.isArray(freshOrders?.rows) ||
      !Number.isInteger(freshOrders.meta?.total) ||
      freshOrders.meta.total < 0 ||
      freshOrders.rows.length < freshOrders.meta.total ||
      !freshInfo
    )
      throw new Error("Incomplete target account resources");
    const fees = binaryFeeRates(freshInfo);
    if (fees.makerRate == null || fees.takerRate == null)
      throw new Error("Missing target account fee rates");
    snapshot.current = {
      positions: freshPositions,
      orders: freshOrders,
      info: freshInfo,
    };
    return { balance: 0, getCollateralSnapshot, availableQuantity };
  }, [
    canSubmit,
    positions.mutate,
    orders.mutate,
    info.mutate,
    getCollateralSnapshot,
    availableQuantity,
  ]);
  return {
    targetAccountId,
    targetAuthorized: enabled && allowed && !revoked.current,
    accountState: { ...state, accountId: targetAccountId },
    accountReady: ready,
    balance: 0,
    positions: (positions.data?.rows ?? [])
      .filter((row) => isBinarySymbol(row.symbol) && row.position_qty !== 0)
      .map((row) => toPredictionPosition(row, targetAccountId)),
    openOrders: filterPredictionOrders(orders.data?.rows ?? []),
    pendingOrdersComplete: complete,
    ordersLoading: orders.isLoading || info.isLoading,
    ordersError: orders.error || info.error,
    positionsLoading: positions.isLoading,
    positionsError: positions.error,
    feeRates: binaryFeeRates(info.data),
    availableQuantity,
    getCollateralSnapshot,
    refreshForSubmission,
    canSubmit,
    refreshAccountPositions: positions.mutate,
    refreshOrders: async () => {
      await orders.mutate();
    },
  };
}
