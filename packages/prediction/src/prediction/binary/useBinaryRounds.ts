import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage, useQuery } from "@orderly.network/hooks";
import { getTimestamp } from "@orderly.network/utils";
import { usePredictionMarkets } from "../hooks/usePredictionMarkets";
import type {
  PredictionOutcome,
  PredictionRoundPhase,
} from "../prediction.types";
import {
  type BinaryInfoRow,
  type BinaryInfoDetail,
  binaryRowRoundStart,
  deriveBinaryPhase,
  isBinaryRowTradable,
} from "./binaryInfo";
import { deriveBinaryMarkets, getBinaryMarketIdentity } from "./binaryMarkets";
import {
  BINARY_RESULT_POLL_DELAY_MS,
  startBinaryRoundClock,
} from "./binaryRoundClock";
import {
  binaryDetailRefreshInterval,
  mergeBinaryDetail,
  nextTradableBinaryRound,
} from "./binarySettlement";

export type UseBinaryRoundsArgs = {
  /** Suspend polling while no consumer route is mounted. */
  active: boolean;
};

/**
 * Round lifecycle driven by the unified Binary info snapshot
 * (`GET /v1/public/binary/info`, api-spec §4). Phases are derived locally from
 * server-calibrated time (the middleware stamps the envelope timestamp offset
 * from any REST response), the waiting-result phase polls the detail endpoint
 * every 5s — starting only after a 5s post-expiry grace period
 * (BINARY_RESULT_POLL_DELAY_MS) — until `result_committed_at` shows up or the
 * round leaves the snapshot.
 */
export const useBinaryRounds = ({ active }: UseBinaryRoundsArgs) => {
  const { rows, isLoading, error } = usePredictionMarkets({ enabled: active });

  /** Pin the selected record so a refreshed snapshot cannot erase its chart. */
  const [selectedRoundInput, setSelectedRoundInput] = useState<
    { marketId: string; round: number; row: BinaryInfoRow } | undefined
  >();
  const clockRows = useMemo(
    () =>
      selectedRoundInput?.row &&
      !rows.some((row) => row.symbol === selectedRoundInput.row.symbol)
        ? [...rows, selectedRoundInput.row]
        : rows,
    [rows, selectedRoundInput?.row],
  );

  const [now, setNow] = useState(() => getTimestamp());
  // Keep scheduling T0, T1-30s and T1 without relying on snapshot changes.
  // Fresh snapshots and reactivation also synchronize server-calibrated time.
  useEffect(() => {
    if (!active) return;
    return startBinaryRoundClock(clockRows, setNow, {
      now: getTimestamp,
      setTimeout: (callback, delay) => window.setTimeout(callback, delay),
      clearTimeout: (timer) => window.clearTimeout(timer),
    });
  }, [active, clockRows]);

  const markets = useMemo(() => deriveBinaryMarkets(rows, now), [rows, now]);
  const [marketInput, setMarketInput] = useLocalStorage<string | null>(
    "orderly_prediction_selected_market",
    null,
  );
  const pinnedIdentity =
    selectedRoundInput && getBinaryMarketIdentity(selectedRoundInput.row);
  const pinnedMarket =
    pinnedIdentity && (marketInput == null || marketInput === pinnedIdentity.id)
      ? { ...pinnedIdentity, currentRow: selectedRoundInput!.row }
      : undefined;
  const market =
    markets.find(
      (item) => item.id === (marketInput ?? selectedRoundInput?.marketId),
    ) ??
    pinnedMarket ??
    markets[0];
  const marketId = market?.id;
  const marketRows = useMemo(
    () => rows.filter((row) => getBinaryMarketIdentity(row)?.id === marketId),
    [rows, marketId],
  );

  const roundByStart = useMemo(() => {
    const map = new Map<number, BinaryInfoRow>();
    marketRows.forEach((row) => map.set(binaryRowRoundStart(row), row));
    return map;
  }, [marketRows]);

  const currentRow = market?.currentRow;
  const round = currentRow ? binaryRowRoundStart(currentRow) : undefined;

  const snapshotSelectedRow =
    selectedRoundInput != null && selectedRoundInput.marketId === marketId
      ? roundByStart.get(selectedRoundInput.round)
      : currentRow;
  const isRoundInSnapshot =
    snapshotSelectedRow != null &&
    roundByStart.has(binaryRowRoundStart(snapshotSelectedRow));
  const listSelectedRow =
    snapshotSelectedRow ??
    (selectedRoundInput?.marketId === marketId
      ? selectedRoundInput?.row
      : undefined);

  // The result is not queryable right at expiry: an immediate request would
  // return no `result_committed_at`, so the detail poll only starts once this
  // grace period has elapsed (the round clock schedules a tick at expire_at +
  // BINARY_RESULT_POLL_DELAY_MS to flip this gate).
  const waitingForResult =
    !!listSelectedRow &&
    now >= listSelectedRow.expire_at + BINARY_RESULT_POLL_DELAY_MS &&
    listSelectedRow.result_committed_at == null;

  const {
    data: detailData,
    error: detailError,
    isLoading: detailLoading,
    mutate: refreshDetail,
  } = useQuery<BinaryInfoDetail>(
    active &&
      isRoundInSnapshot &&
      listSelectedRow &&
      (waitingForResult || listSelectedRow.result_committed_at != null)
      ? `/v1/public/binary/info/${listSelectedRow.symbol}`
      : null,
    {
      refreshInterval: binaryDetailRefreshInterval,
      revalidateOnFocus: false,
    },
  );

  const selectedRow = useMemo(
    () => mergeBinaryDetail(listSelectedRow, detailData),
    [listSelectedRow, detailData],
  );

  useEffect(() => {
    if (!selectedRow || !isRoundInSnapshot) return;
    setSelectedRoundInput((previous) =>
      previous?.row.symbol === selectedRow.symbol &&
      previous.row !== selectedRow
        ? { ...previous, row: selectedRow }
        : previous,
    );
  }, [selectedRow, isRoundInSnapshot]);

  const selectedRound = selectedRow
    ? binaryRowRoundStart(selectedRow)
    : selectedRoundInput != null && selectedRoundInput.marketId === marketId
      ? selectedRoundInput.round
      : round;

  const roundPhase: PredictionRoundPhase = useMemo(
    () =>
      selectedRow
        ? deriveBinaryPhase(selectedRow, now)
        : // Snapshot miss on an old round: keep the terminal "closed" look;
          // the UI surfaces the not-in-snapshot flag separately.
          "closed",
    [selectedRow, now],
  );

  const isRoundTradable =
    isRoundInSnapshot && selectedRow
      ? isBinaryRowTradable(selectedRow, now)
      : false;

  /** S0 once published (null before T0); the target price for the chart. */
  const openingPrice = selectedRow?.s0 ?? undefined;

  const roundOutcomeLookup = useCallback(
    (roundStart: number): PredictionOutcome | undefined => {
      const row = roundByStart.get(roundStart);
      if (row?.result_committed_at == null) return undefined;
      return row.outcome === "DOWN"
        ? "down"
        : row.outcome === "UP"
          ? "up"
          : undefined;
    },
    [roundByStart],
  );

  /** Returns false when the round cannot be selected (e.g. not open yet). */
  const selectMarketRound = useCallback(
    (nextRound: number) => {
      const row = roundByStart.get(nextRound);
      if (
        marketId &&
        row &&
        (row.expire_at <= getTimestamp() ||
          isBinaryRowTradable(row, getTimestamp()))
      ) {
        setSelectedRoundInput({ marketId, round: nextRound, row });
        return true;
      }
      return false;
    },
    [marketId, roundByStart],
  );

  const selectMarket = useCallback(
    (nextMarketId: string) => {
      setMarketInput(nextMarketId);
      setSelectedRoundInput(undefined);
    },
    [setMarketInput],
  );

  const goToLiveRound = useCallback(() => {
    setSelectedRoundInput(undefined);
  }, []);

  const nextTradableRow = useMemo(
    () => nextTradableBinaryRound(marketRows, now),
    [marketRows, now],
  );
  const goToNextRound = useCallback(() => {
    const row = nextTradableBinaryRound(marketRows, getTimestamp());
    if (!marketId || !row) return false;
    setSelectedRoundInput({ marketId, round: binaryRowRoundStart(row), row });
    return true;
  }, [marketId, marketRows]);

  // Selected-row view of the market's rows: replace the snapshot row with the
  // detail-merged copy, or append an expired round that left the snapshot.
  const displayRows = useMemo(
    () =>
      selectedRow &&
      selectedRow.expire_at <= now &&
      !roundByStart.has(binaryRowRoundStart(selectedRow))
        ? [...marketRows, selectedRow]
        : marketRows.map((row) =>
            row.symbol === selectedRow?.symbol ? selectedRow : row,
          ),
    [marketRows, now, roundByStart, selectedRow],
  );

  return {
    rows,
    marketRows: displayRows,
    markets,
    market,
    marketId,
    marketInput,
    selectMarket,
    isLoading,
    error,
    round,
    selectedRound,
    selectedRow,
    now,
    detailError,
    detailLoading,
    refreshDetail,
    nextTradableRow,
    goToNextRound,
    isRoundInSnapshot,
    roundPhase,
    isRoundTradable,
    openingPrice,
    underlyingSymbol:
      selectedRow?.index_price_symbol ?? market?.indexPriceSymbol ?? "",
    roundOutcomeLookup,
    selectMarketRound,
    goToLiveRound,
  };
};

export type BinaryRoundsState = ReturnType<typeof useBinaryRounds>;
