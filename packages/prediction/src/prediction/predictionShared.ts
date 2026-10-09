import { useMemo } from "react";
import { i18n, useLocaleCode } from "@orderly.network/i18n";
import { Decimal } from "@orderly.network/utils";

/**
 * Round ids are the epoch seconds of the round start; consecutive rounds are
 * spaced by this many seconds and each round ends one interval after its id.
 */
export const ROUND_INTERVAL_SECONDS = 300;

/**
 * decimal.js-light has no floor(); step a value onto the tick grid by
 * rounding the tick count down on the integer grid. Number and string
 * wrappers share this core so sizing and submission agree exactly.
 */
export const floorToTickDecimal = (value: number, tick: number) =>
  new Decimal(value)
    .div(tick)
    .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
    .mul(tick);

export const floorToTick = (value: number, tick: number) =>
  floorToTickDecimal(value, tick).toNumber();

/** Map Orderly locale codes to BCP-47 tags that Intl understands. */
export function toIntlLocale(locale?: string): string | undefined {
  const code = locale || i18n.language || undefined;
  if (!code) return undefined;
  if (code === "zh") return "zh-CN";
  if (code === "tc") return "zh-TW";
  return code;
}

export function createUsdFormatter(locale?: string) {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function createContractFormatter(locale?: string) {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function formatUsd(value: number, locale?: string) {
  return createUsdFormatter(locale).format(value);
}

export function formatContracts(value: number, locale?: string) {
  return createContractFormatter(locale).format(value);
}

/** @deprecated Prefer formatUsd(); kept for gradual call-site migration. */
export const usdFormatter = {
  format: (value: number) => formatUsd(value),
};

/** @deprecated Prefer formatContracts(); kept for gradual call-site migration. */
export const contractFormatter = {
  format: (value: number) => formatContracts(value),
};

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
  const parts = new Intl.DateTimeFormat(toIntlLocale(locale), {
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
  const startText = new Intl.DateTimeFormat(intlLocale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
  const endParts = new Intl.DateTimeFormat(intlLocale, {
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
  const dateText = new Intl.DateTimeFormat(intlLocale, {
    month: "2-digit",
    day: "2-digit",
  }).format(end);
  const timeText = new Intl.DateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(end);
  return `${dateText} ${timeText}`;
}

export function formatTableTime(timestamp: number, locale?: string) {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
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
    chartHoverPriceFormatter: new Intl.NumberFormat(intlLocale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
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
      formatUsd: (value: number) => formatUsd(value, locale),
      formatContracts: (value: number) => formatContracts(value, locale),
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
