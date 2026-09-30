import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage, useQuery } from "@orderly.network/hooks";
import { getTimestamp } from "@orderly.network/utils";
import type {
  PredictionOutcome,
  PredictionRoundPhase,
} from "../prediction.types";
import {
  type BinaryInfoRow,
  binaryRowRoundStart,
  deriveBinaryPhase,
  isBinaryRowTradable,
} from "./binaryInfo";
import { deriveBinaryMarkets, getBinaryMarketIdentity } from "./binaryMarkets";
import { startBinaryRoundClock } from "./binaryRoundClock";

export type UseBinaryRoundsArgs = {
  /** Suspend polling while no consumer route is mounted. */
  active: boolean;
};

/**
 * Round lifecycle driven by the unified Binary info snapshot
 * (`GET /v1/public/binary/info`, api-spec §4). Phases are derived locally from
 * server-calibrated time (the middleware stamps the envelope timestamp offset
 * from any REST response), the waiting-result phase polls the detail endpoint
 * every 5s until `result_committed_at` shows up or the round leaves the
 * snapshot.
 */
export const useBinaryRounds = ({ active }: UseBinaryRoundsArgs) => {
  // The net layer unwraps `{ success, data: { rows } }` envelopes to the bare
  // rows array (see `get` in @orderly.network/net), so type the query as an
  // array like every other rows endpoint in the repo.
  const { data, isLoading, error } = useQuery<BinaryInfoRow[]>(
    active ? "/v1/public/binary/info" : null,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const rows = useMemo(() => data ?? [], [data]);

  const [now, setNow] = useState(() => getTimestamp());
  // Keep scheduling T0, T1-30s and T1 without relying on snapshot changes.
  // Fresh snapshots and reactivation also synchronize server-calibrated time.
  useEffect(() => {
    if (!active) return;
    return startBinaryRoundClock(rows, setNow, {
      now: getTimestamp,
      setTimeout: (callback, delay) => window.setTimeout(callback, delay),
      clearTimeout: (timer) => window.clearTimeout(timer),
    });
  }, [active, rows]);

  const markets = useMemo(() => deriveBinaryMarkets(rows, now), [rows, now]);
  const [marketInput, setMarketInput] = useLocalStorage<string | null>(
    "orderly_prediction_selected_market",
    null,
  );
  const market = markets.find((item) => item.id === marketInput) ?? markets[0];
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

  /** `undefined` means "follow the live round". */
  const [selectedRoundInput, setSelectedRoundInput] = useState<
    { marketId: string; round: number } | undefined
  >();

  const listSelectedRow =
    selectedRoundInput != null && selectedRoundInput.marketId === marketId
      ? roundByStart.get(selectedRoundInput.round)
      : currentRow;
  const isRoundInSnapshot = listSelectedRow != null;

  const waitingForResult =
    !!listSelectedRow &&
    now >= listSelectedRow.expire_at &&
    listSelectedRow.result_committed_at == null;

  const { data: detailData } = useQuery<BinaryInfoRow>(
    active && waitingForResult && listSelectedRow
      ? `/v1/public/binary/info/${listSelectedRow.symbol}`
      : null,
    {
      refreshInterval: 5_000,
      revalidateOnFocus: false,
    },
  );

  const selectedRow =
    detailData?.symbol === listSelectedRow?.symbol
      ? detailData
      : listSelectedRow;

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

  const isRoundTradable = selectedRow
    ? isBinaryRowTradable(selectedRow, now)
    : false;

  /** S0 once published (null before T0); the target price for the chart. */
  const openingPrice = selectedRow?.s0 ?? undefined;

  const roundOutcomeLookup = useCallback(
    (roundStart: number): PredictionOutcome | undefined => {
      const row = roundByStart.get(roundStart);
      if (!row?.result_committed_at) return undefined;
      return row.outcome === "DOWN" ? "down" : "up";
    },
    [roundByStart],
  );

  const selectMarketRound = useCallback(
    (nextRound: number) => {
      if (marketId) setSelectedRoundInput({ marketId, round: nextRound });
    },
    [marketId],
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

  return {
    rows,
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
