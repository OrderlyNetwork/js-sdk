import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@orderly.network/hooks";
import { getTimestamp } from "@orderly.network/utils";
import { type BinaryInfoRow, isBinaryRowTradable } from "../binary/binaryInfo";
import { deriveBinaryMarkets } from "../binary/binaryMarkets";
import {
  startBinaryRoundClock,
  subscribeBinaryTime,
} from "../binary/binaryRoundClock";
import type {
  UsePredictionMarketsOptions,
  PredictionMarketsState,
} from "../prediction.types";

/** Shared metadata; page selection and form state belong to the page. */
export const usePredictionMarkets = ({
  enabled = true,
}: UsePredictionMarketsOptions = {}): PredictionMarketsState => {
  const { data, error, isLoading } = useQuery<BinaryInfoRow[]>(
    enabled ? "/v1/public/binary/info" : null,
    {
      refreshInterval: enabled ? 30_000 : 0,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );
  const rows = useMemo(() => (enabled ? (data ?? []) : []), [data, enabled]);
  const [now, setNow] = useState(getTimestamp);
  useEffect(
    () =>
      enabled
        ? startBinaryRoundClock(rows, setNow, {
            now: getTimestamp,
            setTimeout: (callback, delay) => window.setTimeout(callback, delay),
            clearTimeout: (timer) => window.clearTimeout(timer),
            subscribe: subscribeBinaryTime,
          })
        : undefined,
    [enabled, rows],
  );
  const markets = useMemo(() => deriveBinaryMarkets(rows, now), [rows, now]);
  const configBySymbol = useMemo(
    () => new Map(rows.map((row) => [row.symbol, row])),
    [rows],
  );
  return {
    rows,
    markets,
    now,
    error: enabled ? error : undefined,
    isLoading: enabled && !!isLoading,
    configBySymbol,
    isOrderTradable: (symbol?: string) => {
      const row = symbol ? configBySymbol.get(symbol) : undefined;
      return !!row && isBinaryRowTradable(row, getTimestamp());
    },
  };
};
