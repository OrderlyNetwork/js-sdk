import { useMemo } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { i18n, useLocaleCode } from "@orderly.network/i18n";
import { parseNumber } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { ROUND_INTERVAL_SECONDS } from "./binary/binaryInfo";

export { ROUND_INTERVAL_SECONDS } from "./binary/binaryInfo";

/**
 * decimal.js-light has no floor(); step a value onto the tick grid by
 * rounding the tick count down on the integer grid. Number, string and
 * Decimal inputs share this core so sizing and submission agree exactly.
 */
export const floorToTickDecimal = (
  value: number | string | Decimal,
  tick: number,
) =>
  new Decimal(value)
    .div(tick)
    .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
    .mul(tick);

export const floorToTick = (value: number, tick: number) =>
  floorToTickDecimal(value, tick).toNumber();

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Map Orderly locale codes to BCP-47 tags that Intl understands. */
export function toIntlLocale(locale?: string): string | undefined {
  const code = locale || i18n.language || undefined;
  if (!code) return undefined;
  if (code === "zh") return "zh-CN";
  if (code === "tc") return "zh-TW";
  return code;
}

// Intl formatter construction costs 10-100x a format() call, and these
// helpers run inside table row loops that re-render on every tick and
// countdown; cache instances per resolved locale and options.
const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();

function cachedDateTimeFormat(
  intlLocale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${intlLocale ?? ""}|${JSON.stringify(options)}`;
  let formatter = dateTimeFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(intlLocale, options);
    dateTimeFormatterCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Display-dp overrides for underlying index prices, keyed by the binary
 * row's index_price_symbol. They win over the tick-derived dp: BTC's 0.1
 * tick would collapse to 1 dp, but the index feed carries 2 decimals and
 * the product wants them shown.
 */
export const INDEX_PRICE_DP_OVERRIDES: Record<string, number> = {
  PERP_BTC_USDC: 2,
};

/**
 * Decimal places for underlying index prices, mirroring the perp display
 * convention (dp = decimals of the underlying perp's quote_tick) with the
 * constants above taking precedence. Falls back to 2 when neither the
 * symbol's config nor an override is available.
 */
export function resolveIndexPriceDp(
  indexPriceSymbol?: string | null,
  quoteTick?: number | null,
): number {
  if (indexPriceSymbol) {
    const override = INDEX_PRICE_DP_OVERRIDES[indexPriceSymbol];
    if (typeof override === "number") return override;
  }
  if (quoteTick != null && Number.isFinite(quoteTick) && quoteTick > 0) {
    return new Decimal(quoteTick).decimalPlaces();
  }
  return 2;
}

/**
 * Underlying-index-price formatter for a binary row: resolves dp from the
 * index symbol's perp quote_tick via symbolsInfo (override constants win)
 * and formats with the shared parseNumber engine (perp orderbook style).
 */
export function useIndexPriceFormatter(indexPriceSymbol?: string | null) {
  const symbolsInfo = useSymbolsInfo();
  return useMemo(() => {
    const quoteTick = indexPriceSymbol
      ? symbolsInfo[indexPriceSymbol]?.("quote_tick")
      : undefined;
    const dp = resolveIndexPriceDp(
      indexPriceSymbol,
      typeof quoteTick === "number" ? quoteTick : undefined,
    );
    return {
      dp,
      format: (value: number) =>
        Number.isFinite(value)
          ? parseNumber(value, { rule: "price", dp })
          : "--",
    };
  }, [indexPriceSymbol, symbolsInfo]);
}

/**
 * Two-dp USDC amounts ("1,234.56"). parseNumber truncates beyond the dp
 * (Decimal ROUND_DOWN), matching the perp display convention everywhere.
 */
export function formatUsd(value: number) {
  return Number.isFinite(value)
    ? parseNumber(value, { rule: "price", dp: 2 })
    : "--";
}

/** Contract counts: up to 4 dp, no zero padding ("0.5", "1,234.5678"). */
export function formatContracts(value: number) {
  return Number.isFinite(value)
    ? parseNumber(value, { rule: "price", dp: 4, padding: false })
    : "--";
}

/**
 * Shared "$1.23 USDC" assembly: callers keep their own validity condition
 * and pass null/undefined to get the placeholder (suffix still appended).
 */
export function formatUsdAmount(
  value: number | null | undefined,
  options: {
    prefix?: string;
    suffix?: string;
    placeholder?: string;
    approximate?: boolean;
  } = {},
) {
  const {
    prefix = "",
    suffix = "",
    placeholder = "--",
    approximate = false,
  } = options;
  return value == null || !Number.isFinite(value)
    ? `${placeholder}${suffix}`
    : `${approximate ? "≈ " : ""}${prefix}${formatUsd(value)}${suffix}`;
}

/** "MM:SS"; minutes may exceed 59 ("75:30") — for compact two-box countdowns. */
export const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

/**
 * "H:MM:SS" with zero-padded hours ("01:15:30") — for tooltips where
 * hour-scale spans are possible.
 */
export const formatCountdownWithHours = (seconds: number) => {
  const safeSeconds = Math.max(Math.floor(seconds), 0);
  const hours = Math.floor(safeSeconds / 3_600);
  const minutes = Math.floor((safeSeconds % 3_600) / 60);
  const remainingSeconds = safeSeconds % 60;
  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export const formatPercent = (value?: number) =>
  value == null ? "--" : `${value.toFixed(1)}%`;

export const formatContractPrice = (value: number) => value.toFixed(2);

/** Local timezone offset label such as "UTC+8", derived from the runtime timezone. */
export function getLocalTimeZoneOffsetLabel(
  locale?: string,
  date: Date = new Date(),
) {
  const parts = cachedDateTimeFormat(toIntlLocale(locale), {
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const name = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  return name.replace(/^GMT/, "UTC") || "Local";
}

export function formatRoundWindow(
  round: number,
  locale?: string,
  intervalSeconds = ROUND_INTERVAL_SECONDS,
  expireAtMs?: number,
) {
  const intlLocale = toIntlLocale(locale);
  const start = new Date(round * 1_000);
  const end = new Date(expireAtMs ?? start.getTime() + intervalSeconds * 1_000);
  const startText = cachedDateTimeFormat(intlLocale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
  const endParts = cachedDateTimeFormat(intlLocale, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "shortOffset",
  }).formatToParts(end);
  const endTime = endParts
    .filter((part) => part.type !== "timeZoneName")
    .map((part) => part.value)
    .join("")
    .trim();
  const offset =
    endParts
      .find((part) => part.type === "timeZoneName")
      ?.value.replace(/^GMT/, "UTC") ?? "";
  return offset
    ? `${startText} – ${endTime} (${offset})`
    : `${startText} – ${endTime}`;
}

export function formatRoundBadge(
  round: number,
  locale?: string,
  intervalSeconds = ROUND_INTERVAL_SECONDS,
) {
  const intlLocale = toIntlLocale(locale);
  const end = new Date((round + intervalSeconds) * 1_000);
  const dateText = cachedDateTimeFormat(intlLocale, {
    month: "2-digit",
    day: "2-digit",
  }).format(end);
  const timeText = cachedDateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(end);
  return `${dateText} ${timeText}`;
}

export function formatTableTime(timestamp: number, locale?: string) {
  return cachedDateTimeFormat(toIntlLocale(locale), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

export function createPredictionChartFormatters(locale?: string) {
  const intlLocale = toIntlLocale(locale);
  return {
    roundLabelFormatter: new Intl.DateTimeFormat(intlLocale, {
      month: "short",
      day: "numeric",
    }),
    roundTimeFormatter: new Intl.DateTimeFormat(intlLocale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    chartTimeFormatter: new Intl.DateTimeFormat(intlLocale, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }),
    chartHoverTimeFormatter: new Intl.DateTimeFormat(intlLocale, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    /** Local timezone — not a fixed Asia/Taipei offset. */
    resolutionLocalFormatter: new Intl.DateTimeFormat(intlLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    resolutionUtcFormatter: new Intl.DateTimeFormat(intlLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }),
    localOffsetLabel: getLocalTimeZoneOffsetLabel(locale),
  };
}

export function usePredictionFormatters() {
  const localeCode = useLocaleCode();
  return useMemo(() => {
    const locale = String(localeCode);
    return {
      locale,
      formatUsd,
      formatContracts,
      formatRoundWindow: (
        round: number,
        intervalSeconds?: number,
        expireAtMs?: number,
      ) => formatRoundWindow(round, locale, intervalSeconds, expireAtMs),
      formatRoundBadge: (round: number, intervalSeconds?: number) =>
        formatRoundBadge(round, locale, intervalSeconds),
      formatTableTime: (timestamp: number) =>
        formatTableTime(timestamp, locale),
      formatPercent,
      chart: createPredictionChartFormatters(locale),
    };
  }, [localeCode]);
}

/**
 * Depth rows of [price, quantity, cumulativeQuantity, cumulativeNotional].
 * "forward" accumulates from the first level (bids); "backward" accumulates
 * from the last level (asks).
 */
export function accumulateOrderBookLevels(
  levels: Array<{ price: number; quantity: number }>,
  direction: "forward" | "backward",
): Array<[number, number, number, number]> {
  const rows: Array<[number, number, number, number]> = levels.map(
    ({ price, quantity }) => [price, quantity, 0, 0],
  );
  const indices =
    direction === "forward"
      ? rows.map((_, index) => index)
      : rows.map((_, index) => rows.length - 1 - index);
  let cumulativeQuantity = new Decimal(0);
  let cumulativeNotional = new Decimal(0);
  for (const index of indices) {
    const [price, quantity] = rows[index];
    cumulativeQuantity = cumulativeQuantity.add(quantity);
    cumulativeNotional = cumulativeNotional.add(
      new Decimal(quantity).mul(price),
    );
    rows[index][2] = cumulativeQuantity.toNumber();
    rows[index][3] = cumulativeNotional.toNumber();
  }
  return rows;
}

const emptyBookRow = (): [number, number, number, number] => [
  Number.NaN,
  Number.NaN,
  Number.NaN,
  Number.NaN,
];

/**
 * Fit accumulated ladder rows to a per-side budget: shorter sides are padded
 * with inert NaN placeholders (rendered as "-") on the side away from the
 * price row ("before" for asks, "after" for bids, so best levels stay
 * adjacent to it); longer sides are truncated to the best `target` levels
 * (asks tail, bids head), mirroring the perps orderbook level window.
 */
export function fitOrderBookLevels(
  levels: Array<[number, number, number, number]>,
  target: number,
  position: "before" | "after",
): Array<[number, number, number, number]> {
  if (levels.length === target) return levels;
  if (levels.length === 0) {
    return Array.from({ length: target }, emptyBookRow);
  }
  if (levels.length > target) {
    return position === "before"
      ? levels.slice(levels.length - target)
      : levels.slice(0, target);
  }
  const padding = Array.from({ length: target - levels.length }, emptyBookRow);
  return position === "before"
    ? [...padding, ...levels]
    : [...levels, ...padding];
}
