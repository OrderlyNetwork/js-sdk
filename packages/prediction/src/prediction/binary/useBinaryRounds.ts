import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage, useQuery } from "@orderly.network/hooks";
import { getTimestamp, parseBinarySymbol } from "@orderly.network/utils";
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
  subscribeBinaryTime,
} from "./binaryRoundClock";
import {
  binaryDetailRefreshInterval,
  mergeBinaryDetail,
  nextTradableBinaryRound,
} from "./binarySettlement";

export type UseBinaryRoundsArgs = {
  /** Suspend polling while no consumer route is mounted. */
  active: boolean;
  /** Controlled round contract; absent only while the widget initializes. */
  symbol?: string;
  /** Requests selection; the widget decides how the host receives it. */
  onSymbolSelect: (symbol: string) => void;
};

/**
 * Round lifecycle driven by the unified Binary info snapshot
 * (`GET /v1/public/binary/info`, api-spec §4). Phases are derived locally from
 * server-calibrated time (the middleware stamps the envelope timestamp offset
 * from any REST response), the waiting-result phase polls the detail endpoint
 * every 5s — starting only after a 5s post-expiry grace period
 * (BINARY_RESULT_POLL_DELAY_MS). Accepted contracts remain available after
 * leaving the snapshot, and detail polling continues until evidence arrives.
 */
export const useBinaryRounds = ({
  active,
  symbol,
  onSymbolSelect,
}: UseBinaryRoundsArgs) => {
  const { rows, isLoading, error } = usePredictionMarkets({ enabled: active });

  /** Retain only the requested contract after it leaves the snapshot. */
  const [acceptedRow, setAcceptedRow] = useState<BinaryInfoRow>();
  const cachedRow = acceptedRow?.symbol === symbol ? acceptedRow : undefined;
  const clockRows = useMemo(
    () =>
      cachedRow && !rows.some((row) => row.symbol === cachedRow.symbol)
        ? [...rows, cachedRow]
        : rows,
    [rows, cachedRow],
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
      subscribe: subscribeBinaryTime,
    });
  }, [active, clockRows]);

  const markets = useMemo(() => deriveBinaryMarkets(rows, now), [rows, now]);
  const [marketInput, setMarketInput] = useLocalStorage<string | null>(
    "orderly_prediction_selected_market",
    null,
  );
  const parsedSymbol = symbol != null ? parseBinarySymbol(symbol) : undefined;
  const requestedMarketId = parsedSymbol
    ? `PERP_${parsedSymbol.base}${parsedSymbol.period}_${parsedSymbol.quote}`
    : undefined;
  const requestedMarket = parsedSymbol
    ? {
        id: requestedMarketId!,
        base: parsedSymbol.base,
        quote: parsedSymbol.quote,
        period: parsedSymbol.period,
        intervalSeconds: parsedSymbol.intervalSeconds,
        indexPriceSymbol: `PERP_${parsedSymbol.base}_${parsedSymbol.quote}`,
      }
    : undefined;
  const defaultSymbol =
    // Prefer a tradable market (the remembered one, then any live market);
    // fall back to the remembered market's history, then any market, so a
    // fully expired snapshot still anchors to browsable rounds.
    (
      markets.find((item) => item.id === marketInput && item.hasLiveRow) ??
      markets.find((item) => item.hasLiveRow) ??
      markets.find((item) => item.id === marketInput) ??
      markets[0]
    )?.currentRow.symbol;
  const marketRows = useMemo(
    () =>
      rows.filter(
        (row) => getBinaryMarketIdentity(row)?.id === requestedMarketId,
      ),
    [rows, requestedMarketId],
  );
  const roundByStart = useMemo(
    () => new Map(marketRows.map((row) => [binaryRowRoundStart(row), row])),
    [marketRows],
  );
  const snapshotSelectedRow = rows.find(
    (row) =>
      !!parsedSymbol &&
      row.symbol === symbol &&
      getBinaryMarketIdentity(row)?.id === requestedMarketId,
  );
  const listSelectedRow = snapshotSelectedRow ?? cachedRow;
  const isRoundInSnapshot = !!snapshotSelectedRow;
  const waitingForResult =
    !!listSelectedRow &&
    now >= listSelectedRow.expire_at + BINARY_RESULT_POLL_DELAY_MS &&
    listSelectedRow.result_committed_at == null;
  const detailSymbol = parsedSymbol ? symbol : undefined;
  const waitingForOpeningPrice =
    !!listSelectedRow &&
    now >= listSelectedRow.observation_start_at &&
    now < listSelectedRow.expire_at &&
    listSelectedRow.s0 == null;
  const detailRefreshInterval = useCallback(
    (detail?: BinaryInfoDetail) =>
      waitingForOpeningPrice
        ? detail != null &&
          detail.symbol === detailSymbol &&
          detail.s0 != null &&
          Number.isFinite(detail.s0)
          ? 0
          : 2_000
        : binaryDetailRefreshInterval(detail),
    [waitingForOpeningPrice, detailSymbol],
  );
  const {
    data: detailData,
    error: detailError,
    isLoading: detailLoading,
    mutate: refreshDetail,
  } = useQuery<BinaryInfoDetail>(
    active &&
      detailSymbol &&
      (!snapshotSelectedRow ||
        waitingForOpeningPrice ||
        waitingForResult ||
        listSelectedRow?.result_committed_at != null)
      ? `/v1/public/binary/info/${encodeURIComponent(detailSymbol)}`
      : null,
    {
      refreshInterval: detailRefreshInterval,
      // A long provider-level dedupe window must not suppress opening polls.
      dedupingInterval: 1_000,
      revalidateOnFocus: false,
    },
  );
  const validDetail =
    !!detailData &&
    !!detailSymbol &&
    detailData.symbol === detailSymbol &&
    getBinaryMarketIdentity(detailData)?.id === requestedMarketId
      ? detailData
      : undefined;
  const selectedRow = useMemo(() => {
    const merged = listSelectedRow
      ? mergeBinaryDetail(listSelectedRow, validDetail)
      : validDetail;
    // Retain S0 when the detail key pauses at T1 or the snapshot lags behind.
    return merged && merged.s0 == null && cachedRow?.s0 != null
      ? { ...merged, s0: cachedRow.s0 }
      : merged;
  }, [listSelectedRow, validDetail, cachedRow?.s0]);
  const identity = selectedRow && getBinaryMarketIdentity(selectedRow);
  const market = identity
    ? {
        ...identity,
        currentRow:
          markets.find((item) => item.id === identity.id)?.currentRow ??
          selectedRow!,
        hasLiveRow:
          markets.find((item) => item.id === identity.id)?.hasLiveRow ?? false,
      }
    : undefined;
  const marketId = market?.id ?? requestedMarketId;
  const currentRow =
    markets.find((item) => item.id === requestedMarketId)?.currentRow ??
    market?.currentRow;
  const round = currentRow ? binaryRowRoundStart(currentRow) : undefined;
  const selectedRound = selectedRow
    ? binaryRowRoundStart(selectedRow)
    : parsedSymbol
      ? parsedSymbol.roundStartMs / 1_000
      : undefined;
  const isMissingHistoricalRound =
    !!parsedSymbol &&
    parsedSymbol.roundStartMs + parsedSymbol.intervalSeconds * 1_000 <= now &&
    !selectedRow &&
    !isLoading &&
    !detailLoading;
  const canGoToLiveRound =
    !!currentRow &&
    currentRow.status === "ACTIVE" &&
    currentRow.expire_at > now;

  useEffect(() => {
    setAcceptedRow((previous) =>
      previous === selectedRow ? previous : selectedRow,
    );
    if (identity && marketInput !== identity.id) setMarketInput(identity.id);
  }, [selectedRow, identity?.id, marketInput, setMarketInput]);

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
      const row =
        selectedRow && binaryRowRoundStart(selectedRow) === roundStart
          ? selectedRow
          : roundByStart.get(roundStart);
      if (row?.result_committed_at == null) return undefined;
      return row.outcome === "DOWN"
        ? "down"
        : row.outcome === "UP"
          ? "up"
          : undefined;
    },
    [roundByStart, selectedRow],
  );

  /** Returns false when the round cannot be selected (e.g. not open yet). */
  const selectMarketRound = useCallback(
    (nextRound: number) => {
      if (selectedRow && binaryRowRoundStart(selectedRow) === nextRound)
        return true;
      const row = roundByStart.get(nextRound);
      if (
        marketId &&
        row &&
        (row.expire_at <= getTimestamp() ||
          isBinaryRowTradable(row, getTimestamp()))
      ) {
        if (row.symbol === selectedRow?.symbol) return true;
        onSymbolSelect(row.symbol);
        return true;
      }
      return false;
    },
    [marketId, roundByStart, selectedRow?.symbol, onSymbolSelect],
  );

  const goToLiveRound = useCallback(() => {
    if (!currentRow || currentRow.symbol === selectedRow?.symbol) return;
    // A market with only history left has an expired currentRow; jumping to
    // another settled round would be misleading, so keep the selection.
    if (
      currentRow.status !== "ACTIVE" ||
      currentRow.expire_at <= getTimestamp()
    )
      return;
    onSymbolSelect(currentRow.symbol);
  }, [currentRow, selectedRow?.symbol, onSymbolSelect]);

  const nextTradableRow = useMemo(
    () => nextTradableBinaryRound(marketRows, now),
    [marketRows, now],
  );
  const goToNextRound = useCallback(() => {
    const row = nextTradableBinaryRound(marketRows, getTimestamp());
    if (!marketId || !row) return false;
    if (row.symbol === selectedRow?.symbol) return true;
    onSymbolSelect(row.symbol);
    return true;
  }, [marketId, marketRows, selectedRow?.symbol, onSymbolSelect]);

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
    requestedMarket,
    isMissingHistoricalRound,
    canGoToLiveRound,
    marketId,
    defaultSymbol,
    isLoading:
      isLoading ||
      (symbol != null && !!parsedSymbol && !selectedRow && !!detailLoading),
    error: error ?? detailError,
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
