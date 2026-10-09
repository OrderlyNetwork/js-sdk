import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  AssetIcon,
  BarChartIcon,
  CaretDownIcon,
  CaretUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  cn,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Tooltip,
  useMediaQuery,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { binaryRowRoundStart, type BinaryInfoRow } from "./binary/binaryInfo";
import {
  getPriceDifference,
  getRoundNavigation,
  getRoundPrices,
  getRoundStatus,
  secondsUntil,
} from "./binary/binaryRoundView";
import { useRoundNow } from "./hooks/useRoundCountdown";
import type { PredictionChartPoint } from "./prediction.script";
import {
  CANDLE_INTERVAL_MS,
  CANDLE_TICK_INTERVAL_MS,
  CANDLE_WINDOW_MS,
  type PredictionCandle,
  type RoundOutcomeLookup,
} from "./predictionChart.script";
import {
  formatCountdown,
  formatCountdownWithHours,
  toIntlLocale,
  usePredictionFormatters,
} from "./predictionShared";

type PredictionChartMode = "price" | "candles";

const LiveIndicator = () => (
  <span className="oui-prediction-liveIndicator oui-relative oui-inline-flex oui-size-3 oui-flex-none oui-items-center oui-justify-center">
    <span className="oui-liveIndicator-pulse oui-absolute oui-inset-0 oui-animate-ping oui-rounded-full oui-bg-danger oui-opacity-75" />
    <span className="oui-liveIndicator-dot oui-relative oui-size-1.5 oui-rounded-full oui-bg-danger" />
  </span>
);

const CountdownDisplay: React.FC<{
  seconds: number;
  label: string;
  mutedIcon?: boolean;
}> = ({ seconds, label, mutedIcon = false }) => {
  const [minutes, remainingSeconds] = formatCountdown(seconds).split(":");

  return (
    <span className="oui-flex oui-items-center oui-gap-2 oui-whitespace-nowrap">
      {mutedIcon ? (
        <span className="oui-prediction-countdown-dot oui-size-2 oui-flex-none oui-rounded-full oui-bg-base-contrast-36" />
      ) : (
        <LiveIndicator />
      )}
      <span className="oui-prediction-countdown-label oui-text-xs oui-font-medium oui-text-base-contrast-54">
        {label}
      </span>
      <span className="oui-flex oui-items-center oui-gap-1 oui-text-xl oui-font-semibold oui-tabular-nums oui-text-base-contrast">
        <span className="oui-min-w-10 oui-rounded-lg oui-bg-base-7 oui-px-2 oui-py-1 oui-text-center">
          {minutes}
        </span>
        <span className="oui-text-base-contrast">:</span>
        <span className="oui-min-w-10 oui-rounded-lg oui-bg-base-7 oui-px-2 oui-py-1 oui-text-center">
          {remainingSeconds}
        </span>
      </span>
    </span>
  );
};

const RoundNavigator: React.FC<{
  round: number;
  intervalSeconds: number;
  now: number;
  rows: BinaryInfoRow[];
  selectedRound: number;
  onRoundChange: (round: number) => void;
  chartMode: PredictionChartMode;
  onChartModeChange: (mode: PredictionChartMode) => void;
  roundOutcome: RoundOutcomeLookup;
}> = ({
  round,
  intervalSeconds,
  now,
  rows,
  selectedRound,
  onRoundChange,
  chartMode,
  onChartModeChange,
  roundOutcome,
}) => {
  const { t } = useTranslation();
  const { chart } = usePredictionFormatters();
  const isWide = useMediaQuery("(min-width: 1280px)");
  const [menu, setMenu] = useState<"past" | "more" | null>(null);
  const [page, setPage] = useState(0);
  const navigation = getRoundNavigation(
    rows,
    round,
    selectedRound,
    intervalSeconds,
    now,
  );
  // On small screens hidden main buttons must remain reachable from More.
  const future = isWide
    ? navigation.future.filter(
        (row) =>
          !navigation.visible.some((visible) => visible?.symbol === row.symbol),
      )
    : navigation.future;
  const pageCount = Math.max(1, Math.ceil(future.length / 8));
  const currentPage = Math.min(page, pageCount - 1);
  const menuRows =
    menu === "past"
      ? navigation.past
      : future.slice(currentPage * 8, currentPage * 8 + 8);
  const liveRow = rows.find((row) => binaryRowRoundStart(row) === round);
  const today = new Date(liveRow?.expire_at ?? now);
  const formatLabel = (row: BinaryInfoRow) => {
    const expiry = new Date(row.expire_at);
    const isToday = expiry.toDateString() === today.toDateString();
    return `${chart.roundTimeFormatter.format(expiry)} ${isToday ? t("prediction.rounds.today") : chart.roundLabelFormatter.format(expiry)}`;
  };
  const tooltip = (row: BinaryInfoRow) => {
    const status = getRoundStatus(row, now);
    const outcome = roundOutcome(binaryRowRoundStart(row));
    return (
      <div className="oui-w-64 oui-p-2">
        <div className="oui-flex oui-items-center oui-justify-between oui-gap-2 oui-text-sm oui-text-base-contrast">
          <span className="oui-flex oui-items-center oui-gap-2">
            {status === "live" && <LiveIndicator />}
            {t(`prediction.rounds.${status}`)}
          </span>
          <span className="oui-tabular-nums">
            {status === "ended"
              ? outcome
                ? t(`prediction.${outcome}`)
                : "--"
              : formatCountdownWithHours(secondsUntil(row.expire_at, now))}
          </span>
        </div>
        <div className="oui-mt-4 oui-text-xs oui-text-base-contrast-54">
          {t("prediction.rounds.resolutionTime")}
        </div>
        <div className="oui-mt-2 oui-grid oui-grid-cols-[56px_1fr] oui-gap-y-2 oui-text-xs oui-text-base-contrast">
          <span>{chart.localOffsetLabel}</span>
          <span className="oui-text-end">
            {chart.resolutionLocalFormatter.format(new Date(row.expire_at))}
          </span>
          <span>UTC</span>
          <span className="oui-text-end">
            {chart.resolutionUtcFormatter.format(new Date(row.expire_at))}
          </span>
        </div>
      </div>
    );
  };
  const select = (row: BinaryInfoRow) => {
    onRoundChange(binaryRowRoundStart(row));
    setMenu(null);
  };
  const recent = navigation.past
    .filter(
      (row) =>
        !navigation.visible.some((visible) => visible?.symbol === row.symbol),
    )
    .slice(-4);
  const renderMenu = () => (
    <>
      {menuRows.map((row) => (
        <Tooltip
          key={row.symbol}
          content={tooltip(row)}
          side="right"
          className="oui-rounded-xl oui-bg-base-5 oui-p-2"
        >
          <button
            type="button"
            onClick={() => select(row)}
            className={cn(
              "oui-flex oui-w-full oui-items-center oui-gap-2 oui-rounded-lg oui-px-3 oui-py-2.5 oui-text-start oui-text-xs hover:oui-bg-base-6",
              binaryRowRoundStart(row) === selectedRound
                ? "oui-bg-base-6 oui-text-base-contrast"
                : "oui-text-base-contrast-54",
            )}
          >
            {getRoundStatus(row, now) === "ended" ? (
              roundOutcome(binaryRowRoundStart(row)) === "up" ? (
                <CaretUpIcon size={12} color="inherit" />
              ) : roundOutcome(binaryRowRoundStart(row)) === "down" ? (
                <CaretDownIcon size={12} color="inherit" />
              ) : (
                <span>--</span>
              )
            ) : (
              <span className="oui-size-1.5 oui-rounded-full oui-bg-base-contrast-36" />
            )}
            {formatLabel(row)}
          </button>
        </Tooltip>
      ))}
      {menu === "more" && pageCount > 1 && (
        <div className="oui-flex oui-items-center oui-justify-between oui-gap-2 oui-p-2 oui-text-xs oui-text-base-contrast-54">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
            className="disabled:oui-opacity-36"
          >
            {t("prediction.rounds.previousPage")}
          </button>
          <span>
            {currentPage + 1}/{pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage === pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
            className="disabled:oui-opacity-36"
          >
            {t("prediction.rounds.nextPage")}
          </button>
        </div>
      )}
    </>
  );
  return (
    <div className="oui-absolute oui-inset-x-0 oui-bottom-0 oui-z-20 oui-flex oui-h-14 oui-items-center oui-gap-2 oui-border-t oui-border-line-6 oui-bg-base-9 oui-px-3">
      <div className="oui-flex oui-min-w-0 oui-flex-1 oui-items-center oui-gap-2 oui-overflow-x-auto oui-hide-scrollbar">
        <PopoverRoot
          open={menu === "past"}
          onOpenChange={(open) => setMenu(open ? "past" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={navigation.past.length === 0}
              className="oui-flex oui-shrink-0 oui-items-center oui-gap-2 oui-rounded-full oui-bg-base-7 oui-px-3 oui-py-2 oui-text-xs oui-text-base-contrast-54 disabled:oui-opacity-36"
            >
              {t("prediction.rounds.past")}
              <CaretDownIcon size={14} color="inherit" />
              <span className="oui-hidden oui-items-center oui-gap-1.5 2xl:oui-flex">
                {Array.from({ length: 4 }, (_, index) => {
                  const row = recent[index];
                  const result = row && roundOutcome(binaryRowRoundStart(row));
                  const icon = (
                    <span
                      className={cn(
                        "oui-flex oui-size-5 oui-items-center oui-justify-center oui-rounded-full",
                        result === "up"
                          ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                          : result === "down"
                            ? "oui-bg-trade-loss/15 oui-text-trade-loss"
                            : "oui-text-base-contrast-36",
                      )}
                    >
                      {result === "up" ? (
                        <CaretUpIcon size={12} color="inherit" />
                      ) : result === "down" ? (
                        <CaretDownIcon size={12} color="inherit" />
                      ) : (
                        "--"
                      )}
                    </span>
                  );
                  return row ? (
                    <Tooltip key={row.symbol} content={tooltip(row)}>
                      {icon}
                    </Tooltip>
                  ) : (
                    <React.Fragment key={index}>{icon}</React.Fragment>
                  );
                })}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="top"
            sideOffset={8}
            className="oui-max-h-72 oui-w-56 oui-overflow-y-auto oui-custom-scrollbar oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
          >
            {renderMenu()}
          </PopoverContent>
        </PopoverRoot>
        {navigation.visible.map((row, index) =>
          row ? (
            <div
              key={row.symbol}
              className={cn(
                binaryRowRoundStart(row) !== selectedRound &&
                  binaryRowRoundStart(row) !== round &&
                  "oui-hidden 2xl:oui-block",
              )}
            >
              <Tooltip
                content={tooltip(row)}
                side="top"
                className="oui-rounded-xl oui-bg-base-5 oui-p-2"
              >
                <button
                  type="button"
                  onClick={() => select(row)}
                  className={cn(
                    "oui-prediction-roundNavigator-round-btn oui-flex oui-shrink-0 oui-items-center oui-gap-2 oui-rounded-full oui-px-4 oui-py-2 oui-text-xs",
                    binaryRowRoundStart(row) === selectedRound
                      ? "oui-bg-base-5 oui-text-base-contrast"
                      : "oui-bg-base-7 oui-text-base-contrast-36",
                  )}
                >
                  {getRoundStatus(row, now) === "live" && <LiveIndicator />}
                  {chart.roundTimeFormatter.format(new Date(row.expire_at))}
                </button>
              </Tooltip>
            </div>
          ) : (
            <button
              key={`missing-${index}`}
              type="button"
              disabled
              className="oui-hidden oui-rounded-full oui-bg-base-7 oui-px-4 oui-py-2 oui-text-xs oui-text-base-contrast-36 2xl:oui-block"
            >
              --
            </button>
          ),
        )}
        <PopoverRoot
          open={menu === "more"}
          onOpenChange={(open) => {
            setMenu(open ? "more" : null);
            setPage(0);
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={future.length === 0}
              className="oui-flex oui-shrink-0 oui-items-center oui-gap-1 oui-rounded-full oui-bg-base-7 oui-px-3 oui-py-2 oui-text-xs oui-text-base-contrast-54 disabled:oui-opacity-36"
            >
              {t("prediction.rounds.more")}
              <CaretDownIcon size={14} color="inherit" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="top"
            sideOffset={8}
            className="oui-max-h-72 oui-w-56 oui-overflow-y-auto oui-custom-scrollbar oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
          >
            {renderMenu()}
          </PopoverContent>
        </PopoverRoot>
      </div>
      <div className="oui-flex oui-items-center oui-gap-1 oui-rounded-lg oui-bg-base-10 oui-p-1">
        {(["price", "candles"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-label={t(
              mode === "price"
                ? "prediction.chart.priceMode"
                : "prediction.chart.chartMode",
            )}
            aria-pressed={chartMode === mode}
            onClick={() => onChartModeChange(mode)}
            className={cn(
              "oui-flex oui-size-8 oui-items-center oui-justify-center oui-rounded-md",
              chartMode === mode
                ? "oui-bg-base-5 oui-text-primary"
                : "oui-text-base-contrast-36",
            )}
          >
            {mode === "price" ? <AssetIcon /> : <BarChartIcon />}
          </button>
        ))}
      </div>
    </div>
  );
};

export const PriceChart: React.FC<{
  intervalSeconds: number;
  base: string;
  selectedRound: number;
  onSelectRound: (round: number) => void;
  points: PredictionChartPoint[];
  /** Real minute-candle seeds from the public index-price history. */
  candles: PredictionCandle[];
  /** Round outcome lookup from the binary info snapshot. */
  roundOutcome: RoundOutcomeLookup;
  selectedRow: BinaryInfoRow | undefined;
  rows: BinaryInfoRow[];
  currentPrice: number | undefined;
  round: number;
  onGoToLiveMarket: () => void;
}> = ({
  intervalSeconds,
  base,
  selectedRound,
  onSelectRound,
  points,
  candles,
  roundOutcome,
  selectedRow,
  rows,
  currentPrice,
  round,
  onGoToLiveMarket,
}) => {
  const { t } = useTranslation();
  const { chart: intl, formatUsd, locale } = usePredictionFormatters();
  // All visible round clocks use one calibrated leaf-local heartbeat.
  const now = useRoundNow(
    Math.max(selectedRow?.expire_at ?? 0, ...rows.map((row) => row.expire_at)),
  );
  const countdown = selectedRow ? secondsUntil(selectedRow.expire_at, now) : 0;
  const [chartMode, setChartMode] = useState<PredictionChartMode>("price");
  const status = selectedRow ? getRoundStatus(selectedRow, now) : undefined;
  const isPastRound = status === "ended";
  const isFutureRound = status === "upcoming";

  const [hoveredPoint, setHoveredPoint] = useState<
    (PredictionChartPoint & { xRatio: number; yRatio: number }) | null
  >(null);
  const width = 720;
  const height = 230;
  const plotWidth = 650;
  const plotHeight = height;
  const windowDuration = 60 * 60 * 1_000;
  const candleScaleRef = useRef<{
    round: number;
    minimum: number;
    maximum: number;
    step: number;
  } | null>(null);
  // Measured width of the tick-label strip: label density follows the real
  // card width instead of a breakpoint, so labels never collide.
  const xLabelsRef = useRef<HTMLDivElement>(null);
  const [xLabelsWidth, setXLabelsWidth] = useState(0);

  useEffect(() => {
    const el = xLabelsRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // borderBoxSize is absent on older Safari; the strip carries no
        // padding/border, so contentRect.width is an exact fallback.
        setXLabelsWidth(
          entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width,
        );
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setHoveredPoint(null);
  }, [selectedRound]);
  const liveTimestamp = now;
  const chartCandles = useMemo(
    () =>
      candles.filter(
        (candle) =>
          selectedRow == null || candle.timestamp < selectedRow.expire_at,
      ),
    [candles, selectedRow?.expire_at],
  );
  const chartPoints = useMemo(
    () =>
      points.filter(
        (point) =>
          selectedRow == null || point.timestamp < selectedRow.expire_at,
      ),
    [points, selectedRow?.expire_at],
  );
  const prices = selectedRow
    ? getRoundPrices(selectedRow, currentPrice, now)
    : { opening: undefined, current: undefined };
  const chartOpeningPrice = prices.opening;
  const chartCurrentPrice = prices.current;
  const difference = getPriceDifference(chartCurrentPrice, chartOpeningPrice);
  const futureCountdown = selectedRow
    ? secondsUntil(selectedRow.observation_start_at, now)
    : 0;

  const chart = useMemo(() => {
    const isCandleMode = chartMode === "candles";
    const roundEnd = selectedRow?.expire_at ?? now;
    // Candle charts pin the latest candle to the right edge (one candle of
    // padding) and label ticks backwards from it, so the axis only shifts
    // when a new candle opens.
    const candleAnchor =
      chartCandles.at(-1)?.timestamp ??
      (isPastRound ? roundEnd : liveTimestamp);
    const windowEnd = isCandleMode
      ? candleAnchor + CANDLE_INTERVAL_MS
      : isPastRound
        ? roundEnd
        : liveTimestamp;
    const windowStart =
      windowEnd -
      (isCandleMode ? CANDLE_WINDOW_MS : isPastRound ? windowDuration : 60_000);
    const tickInterval = isCandleMode
      ? CANDLE_TICK_INTERVAL_MS
      : isPastRound
        ? intervalSeconds * 1_000
        : 10_000;
    const firstTick = isCandleMode
      ? candleAnchor -
        Math.floor((candleAnchor - windowStart) / tickInterval) * tickInterval
      : Math.ceil(windowStart / tickInterval) * tickInterval;
    const lastTick = isCandleMode ? candleAnchor : windowEnd;
    const tickTimestamps = Array.from(
      { length: Math.floor((lastTick - firstTick) / tickInterval) + 1 },
      (_, index) => firstTick + index * tickInterval,
    );
    const visibleCandles = isCandleMode
      ? chartCandles.filter(
          (candle) =>
            candle.timestamp >= windowStart && candle.timestamp <= windowEnd,
        )
      : [];
    const visiblePoints = isCandleMode
      ? []
      : chartPoints.filter(
          (point) =>
            point.timestamp >= windowStart && point.timestamp <= windowEnd,
        );
    const activeWindowDuration = Math.max(windowEnd - windowStart, 1);
    const values = [
      ...visiblePoints.map((point) => point.price),
      ...visibleCandles.flatMap((candle) => [candle.high, candle.low]),
      ...(!isFutureRound && chartOpeningPrice != null
        ? [chartOpeningPrice]
        : []),
      ...(chartCurrentPrice != null ? [chartCurrentPrice] : []),
    ];
    const rawMinimum = values.length ? Math.min(...values) : 0;
    const rawMaximum = values.length ? Math.max(...values) : 1;
    const padding = Math.max(
      (rawMaximum - rawMinimum) * 0.15,
      Math.abs(chartCurrentPrice ?? rawMaximum) * 0.0001,
      0.000001,
    );
    const roughStep = (rawMaximum - rawMinimum + padding * 2) / 5;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const step =
      ([1, 2, 5, 10].find((value) => value * magnitude >= roughStep) ?? 10) *
      magnitude;
    const nextScale = {
      round: selectedRound,
      minimum: Math.floor((rawMinimum - padding) / step) * step,
      maximum: Math.ceil((rawMaximum + padding) / step) * step,
      step,
    };
    const cachedScale = candleScaleRef.current;
    const keepCandleScale =
      isCandleMode &&
      cachedScale?.round === selectedRound &&
      rawMinimum >= cachedScale.minimum &&
      rawMaximum <= cachedScale.maximum;
    const scale = keepCandleScale ? cachedScale : nextScale;
    if (isCandleMode && !keepCandleScale) candleScaleRef.current = scale;
    const { minimum, maximum } = scale;
    const range = maximum - minimum;
    const getY = (price?: number) =>
      plotHeight -
      (((price ?? (minimum + maximum) / 2) - minimum) / range) * plotHeight;
    const getX = (timestamp: number) =>
      ((timestamp - windowStart) / activeWindowDuration) * plotWidth;
    const line = visiblePoints
      .map((point, index) => {
        const x = getX(point.timestamp);
        const y = getY(point.price);
        if (index === 0) return `M ${x},${y}`;
        const previous = visiblePoints[index - 1];
        const previousX = getX(previous.timestamp);
        const previousY = getY(previous.price);
        const middleX = (previousX + x) / 2;
        return `C ${middleX},${previousY} ${middleX},${y} ${x},${y}`;
      })
      .join(" ");
    const firstPoint = visiblePoints.at(0);
    const lastPoint = visiblePoints.at(-1);
    const candleWidth = Math.max(
      Math.min((plotWidth / Math.max(visibleCandles.length, 1)) * 0.62, 8),
      2,
    );
    const renderedCandles = visibleCandles.map((candle) => ({
      ...candle,
      x: getX(candle.timestamp),
      openY: getY(candle.open),
      highY: getY(candle.high),
      lowY: getY(candle.low),
      closeY: getY(candle.close),
      up: candle.close >= candle.open,
    }));
    return {
      line,
      area: line
        ? `${line} L ${lastPoint ? getX(lastPoint.timestamp) : 0},${plotHeight} L ${firstPoint ? getX(firstPoint.timestamp) : 0},${plotHeight} Z`
        : "",
      openingY: getY(chartOpeningPrice),
      currentY: getY(chartCurrentPrice),
      openingRatio: getY(chartOpeningPrice) / plotHeight,
      endpointXRatio: (lastPoint ? getX(lastPoint.timestamp) : 0) / width,
      endpointYRatio:
        (lastPoint ? getY(lastPoint.price) : getY(chartCurrentPrice)) / height,
      candles: renderedCandles,
      candleWidth,
      hoverPoints: isCandleMode
        ? visibleCandles.map((candle) => ({
            price: candle.close,
            timestamp: candle.timestamp,
            xRatio: getX(candle.timestamp) / plotWidth,
            yRatio: getY(candle.close) / height,
          }))
        : visiblePoints.map((point) => ({
            ...point,
            xRatio: getX(point.timestamp) / plotWidth,
            yRatio: getY(point.price) / height,
          })),
      yTicks: Array.from(
        { length: Math.round(range / scale.step) + 1 },
        (_, index) => {
          const value = maximum - index * scale.step;
          return { ratio: (maximum - value) / range, value };
        },
      ),
      yDecimals: Math.max(0, -Math.floor(Math.log10(scale.step))),
      xTicks: tickTimestamps
        .map((timestamp) => ({
          timestamp,
          ratio: getX(timestamp) / plotWidth,
        }))
        .filter(({ ratio }) =>
          isCandleMode
            ? ratio >= 0.02 && ratio <= 1
            : ratio >= 0.04 && ratio <= 0.96,
        ),
    };
  }, [
    chartCandles,
    chartCurrentPrice,
    chartMode,
    chartOpeningPrice,
    chartPoints,
    isFutureRound,
    selectedRound,
    isPastRound,
    liveTimestamp,
    selectedRow?.expire_at,
    intervalSeconds,
  ]);

  // Thin ticks greedily so adjacent labels keep ~88px ("11:14:50 AM" at
  // text-xs) and never collide, whatever the card's rendered width.
  const visibleXTicks = useMemo(() => {
    if (xLabelsWidth <= 0) return chart.xTicks;
    const ticks: typeof chart.xTicks = [];
    for (const tick of chart.xTicks) {
      if (
        ticks.length === 0 ||
        (tick.ratio - ticks[ticks.length - 1].ratio) * xLabelsWidth >= 88
      ) {
        ticks.push(tick);
      }
    }
    return ticks;
  }, [chart.xTicks, xLabelsWidth]);

  const isUp = difference?.isUp ?? false;
  const liveTargetDirection =
    status !== "live" || !difference || difference.amount === 0
      ? null
      : difference.amount > 0
        ? "down"
        : "up";

  const handleChartPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (chart.hoverPoints.length === 0) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerRatio = Math.min(
      Math.max((event.clientX - bounds.left) / bounds.width, 0),
      1,
    );
    const nearestPoint = chart.hoverPoints.reduce((nearest, point) =>
      Math.abs(point.xRatio - pointerRatio) <
      Math.abs(nearest.xRatio - pointerRatio)
        ? point
        : nearest,
    );
    setHoveredPoint(nearestPoint);
  };

  return (
    <div className="oui-prediction-priceChart oui-relative oui-h-[470px] oui-overflow-hidden oui-rounded-xl oui-bg-base-9 oui-p-4 md:oui-h-[420px] lg:oui-h-[360px] 2xl:oui-h-[calc(100vh-330px)] 2xl:oui-min-h-[480px] 2xl:oui-max-h-[640px]">
      <style>{`
        .oui-prediction-priceChart { --oui-prediction-chart-top: 180px; }
        @media (min-width: 390px) {
          .oui-prediction-priceChart { --oui-prediction-chart-top: 140px; }
        }
        @media (min-width: 1280px) {
          .oui-prediction-priceChart { --oui-prediction-chart-top: 80px; }
        }
        @keyframes oui-prediction-target-pulse {
          0%, 100% { opacity: 0.36; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .oui-prediction-target-direction-muted {
            animation: none !important;
            opacity: 1;
          }
        }
      `}</style>
      {/* Below 1280px (mobile/tablet panel) the action (countdown /
          go-to-live) is ordered onto its own right-aligned row above the
          price stats, matching the mobile design; 2xl:order-none restores
          DOM order and ms-auto right-aligns it on the single-row desktop
          header. Below 390px the two price stats stack (measured: even
          base-size side-by-side type needs ~310px, unavailable under
          ~381px viewport); from 390px they sit side by side with reduced
          base/2xs type, stepping back up to xl at 430px. z-30 stays above
          the chart hover layer (z-20 @ top-20) so the action remains
          clickable over the chart. */}
      <div className="oui-relative oui-z-30 oui-flex oui-flex-wrap oui-items-start oui-gap-x-3 oui-gap-y-2 min-[480px]:oui-gap-x-4 2xl:oui-items-center 2xl:oui-gap-x-8">
        <div className="oui-w-full min-[390px]:oui-flex-none min-[390px]:oui-w-auto">
          <Tooltip
            content={t("prediction.chart.priceToBeatHint")}
            className="oui-max-w-[330px] oui-bg-base-6"
            arrow={{ className: "oui-fill-base-6" }}
            delayDuration={300}
          >
            <span className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12 oui-text-xs oui-text-base-contrast-54">
              {t("prediction.chart.priceToBeat")}
            </span>
          </Tooltip>
          <div className="oui-mt-1 oui-text-base oui-font-semibold oui-tabular-nums oui-text-base-contrast-54 min-[430px]:oui-text-xl">
            {chartOpeningPrice == null
              ? isFutureRound
                ? t("prediction.strikePending")
                : "--"
              : `$${formatUsd(chartOpeningPrice)}`}
          </div>
        </div>
        <div className="oui-min-w-0 oui-flex-1 2xl:oui-flex-none">
          {isPastRound ? (
            <span className="oui-text-xs oui-text-base-contrast-54">
              {t("prediction.finalPrice")}
            </span>
          ) : (
            <Tooltip
              content={t("prediction.chart.currentPriceHint")}
              className="oui-max-w-[330px] oui-bg-base-6"
              arrow={{ className: "oui-fill-base-6" }}
              delayDuration={300}
            >
              <span className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12 oui-text-xs oui-text-base-contrast-54">
                {t("prediction.currentPrice")}
              </span>
            </Tooltip>
          )}
          <div className="oui-mt-1 oui-flex oui-flex-wrap oui-items-center oui-gap-x-2 oui-gap-y-1">
            <span
              className={cn(
                "oui-whitespace-nowrap oui-text-base oui-font-semibold oui-tabular-nums min-[430px]:oui-text-xl",
                isPastRound ? "oui-text-base-contrast" : "oui-text-primary",
              )}
            >
              {chartCurrentPrice == null
                ? "--"
                : `$${formatUsd(chartCurrentPrice)}`}
            </span>
            {!isFutureRound && difference && (
              <span
                className={cn(
                  "oui-whitespace-nowrap oui-text-2xs oui-tabular-nums min-[480px]:oui-text-xs",
                  isUp ? "oui-text-trade-profit" : "oui-text-trade-loss",
                )}
              >
                {isUp ? (
                  <CaretUpIcon
                    className="oui-inline-block"
                    size={14}
                    color="inherit"
                  />
                ) : (
                  <CaretDownIcon
                    className="oui-inline-block"
                    size={14}
                    color="inherit"
                  />
                )}{" "}
                {`${difference.amount > 0 ? "+" : difference.amount < 0 ? "−" : ""}$${formatUsd(Math.abs(difference.amount))}`}
                {" ("}
                {difference.percent == null
                  ? "--"
                  : `${difference.percent > 0 ? "+" : ""}${new Decimal(difference.percent).toFixed(2)}%`}
                {")"}
              </span>
            )}{" "}
            {!isFutureRound && !difference && (
              <span className="oui-text-2xs oui-tabular-nums oui-text-base-contrast-36">
                --
              </span>
            )}
          </div>
        </div>
        <div className="oui-order-first oui-flex oui-w-full oui-justify-end 2xl:oui-w-auto 2xl:oui-ms-auto 2xl:oui-flex-none 2xl:oui-order-none">
          {isFutureRound || status === "live" ? (
            <CountdownDisplay
              seconds={isFutureRound ? futureCountdown : countdown}
              label={t(
                isFutureRound
                  ? "prediction.rounds.startsIn"
                  : "prediction.rounds.endsIn",
              )}
              mutedIcon={isFutureRound}
            />
          ) : (
            <button
              type="button"
              onClick={onGoToLiveMarket}
              className="oui-flex oui-items-center oui-gap-2 oui-rounded-full oui-bg-base-7 oui-px-4 oui-py-2.5 oui-text-sm oui-text-base-contrast-80 hover:oui-bg-base-6 2xl:oui-px-3 2xl:oui-py-2 2xl:oui-text-xs"
            >
              <LiveIndicator />
              {t("prediction.rounds.goToLiveMarket")}
              <ChevronRightIcon size={14} color="inherit" />
            </button>
          )}
        </div>
      </div>
      <>
        <svg
          className={cn(
            "oui-absolute oui-inset-x-4 oui-w-[calc(100%-2rem)]",
            isPastRound ? "oui-text-base-contrast-54" : "oui-text-primary",
          )}
          style={{
            top: "var(--oui-prediction-chart-top)",
            height: "calc(100% - var(--oui-prediction-chart-top) - 88px)",
          }}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={t("prediction.chart.marketAriaLabel", { base })}
        >
          {(chartPoints.length || chartCandles.length ? chart.yTicks : []).map(
            ({ ratio }) => (
              <line
                key={ratio}
                x1="0"
                x2={plotWidth}
                y1={height * ratio}
                y2={height * ratio}
                className="oui-text-line-6"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ),
          )}
          {!isFutureRound && chartOpeningPrice != null && (
            <line
              x1="0"
              x2={width}
              y1={chart.openingY}
              y2={chart.openingY}
              className="oui-text-base-contrast-36"
              stroke="currentColor"
              strokeDasharray="5 5"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {!isFutureRound && chartCurrentPrice != null && (
            <line
              x1="0"
              x2={width}
              y1={chart.currentY}
              y2={chart.currentY}
              stroke="currentColor"
              strokeDasharray="5 5"
              strokeOpacity="0.65"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {chartMode === "price" ? (
            <>
              <path d={chart.area} fill="currentColor" fillOpacity="0.08" />
              <path
                d={chart.line}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : (
            chart.candles.map((candle) => {
              const bodyY = Math.min(candle.openY, candle.closeY);
              const bodyHeight = Math.max(
                Math.abs(candle.closeY - candle.openY),
                1.5,
              );
              return (
                <g
                  key={candle.timestamp}
                  className={
                    candle.up ? "oui-text-trade-profit" : "oui-text-trade-loss"
                  }
                >
                  <line
                    x1={candle.x}
                    x2={candle.x}
                    y1={candle.highY}
                    y2={candle.lowY}
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <rect
                    x={candle.x - chart.candleWidth / 2}
                    y={bodyY}
                    width={chart.candleWidth}
                    height={bodyHeight}
                    fill="currentColor"
                  />
                </g>
              );
            })
          )}
        </svg>
        <div
          className="oui-absolute oui-start-4 oui-z-20 oui-cursor-crosshair"
          style={{
            top: "var(--oui-prediction-chart-top)",
            height: "calc(100% - var(--oui-prediction-chart-top) - 88px)",
            width: `calc((100% - 32px) * ${plotWidth / width})`,
          }}
          onPointerMove={handleChartPointerMove}
          onPointerLeave={() => setHoveredPoint(null)}
        >
          {hoveredPoint && (
            <>
              <span
                className="oui-pointer-events-none oui-absolute oui-inset-y-0 oui-border-s oui-border-dashed oui-border-base-contrast-54"
                style={{ left: `${hoveredPoint.xRatio * 100}%` }}
              />
              <span
                className="oui-pointer-events-none oui-absolute oui-size-2 -oui-translate-x-1/2 -oui-translate-y-1/2 oui-rounded-full oui-bg-base-contrast oui-shadow-[0_0_0_4px_rgb(var(--oui-color-base-foreground)/0.18)]"
                style={{
                  left: `${hoveredPoint.xRatio * 100}%`,
                  top: `${hoveredPoint.yRatio * 100}%`,
                }}
              />
              <div
                className="oui-pointer-events-none oui-absolute oui-top-3 oui-min-w-40 oui-rounded-lg oui-border oui-border-line-12 oui-bg-base-5 oui-px-4 oui-py-3 oui-shadow-xl"
                style={{
                  left: `${hoveredPoint.xRatio * 100}%`,
                  transform:
                    hoveredPoint.xRatio > 0.72
                      ? "translateX(calc(-100% - 12px))"
                      : "translateX(12px)",
                }}
              >
                <div className="oui-whitespace-nowrap oui-text-sm oui-font-normal oui-tabular-nums oui-text-base-contrast-54">
                  {intl.chartHoverTimeFormatter.format(
                    new Date(hoveredPoint.timestamp),
                  )}
                </div>
                <div className="oui-mt-2 oui-whitespace-nowrap oui-text-base oui-font-semibold oui-tabular-nums oui-text-base-contrast">
                  ${intl.chartHoverPriceFormatter.format(hoveredPoint.price)}
                </div>
              </div>
            </>
          )}
        </div>
        {chartMode === "price" && chartPoints.length > 0 && (
          <span
            className={cn(
              "oui-pointer-events-none oui-absolute oui-z-10 oui-h-3 oui-w-3 -oui-translate-x-1/2 -oui-translate-y-1/2 oui-rounded-full",
              isPastRound
                ? "oui-bg-base-contrast oui-shadow-[0_0_0_6px_rgb(var(--oui-color-base-foreground)/0.24)]"
                : "oui-bg-primary oui-shadow-[0_0_0_6px_rgb(var(--oui-color-primary)/0.24)]",
            )}
            style={{
              left: `calc(16px + (100% - 32px) * ${chart.endpointXRatio})`,
              top: `calc(var(--oui-prediction-chart-top) + (100% - var(--oui-prediction-chart-top) - 88px) * ${chart.endpointYRatio})`,
            }}
          />
        )}
        {(chartPoints.length || chartCandles.length ? chart.yTicks : []).map(
          ({ ratio, value }) => (
            <span
              key={ratio}
              className="oui-pointer-events-none oui-absolute oui-end-4 oui-z-10 -oui-translate-y-1/2 oui-text-xs oui-tabular-nums oui-text-base-contrast-36"
              style={{
                top: `calc(var(--oui-prediction-chart-top) + (100% - var(--oui-prediction-chart-top) - 88px) * ${ratio})`,
              }}
            >
              $
              {value.toLocaleString(toIntlLocale(locale), {
                minimumFractionDigits: chart.yDecimals,
                maximumFractionDigits: chart.yDecimals,
              })}
            </span>
          ),
        )}
        {!isFutureRound && chartOpeningPrice != null && (
          <div
            className="oui-pointer-events-none oui-absolute oui-end-3 oui-z-10 oui-flex -oui-translate-y-1/2 oui-items-center oui-rounded-e-md oui-bg-base-3 oui-px-3 oui-py-1 oui-text-xs oui-text-base-contrast"
            style={{
              top: `calc(var(--oui-prediction-chart-top) + (100% - var(--oui-prediction-chart-top) - 88px) * ${chart.openingRatio})`,
            }}
          >
            <span className="oui-absolute -oui-start-2 oui-top-1/2 -oui-translate-y-1/2 oui-border-y-[12px] oui-border-e-[10px] oui-border-y-transparent oui-border-e-base-3" />
            {t("prediction.chart.target")}
            {liveTargetDirection && (
              <span className="oui-prediction-target-direction oui-ms-1 oui-inline-flex oui-h-5 oui-w-5 oui-flex-col oui-items-center oui-justify-center">
                {liveTargetDirection === "down" ? (
                  <>
                    <ChevronDownIcon
                      className="oui-prediction-target-direction-muted -oui-mb-1"
                      size={14}
                      color="inherit"
                      style={{
                        animation:
                          "oui-prediction-target-pulse 1.2s ease-in-out infinite",
                      }}
                    />
                    <ChevronDownIcon
                      className="-oui-mt-1"
                      size={14}
                      color="inherit"
                    />
                  </>
                ) : (
                  <>
                    <ChevronUpIcon
                      className="-oui-mb-1"
                      size={14}
                      color="inherit"
                    />
                    <ChevronUpIcon
                      className="oui-prediction-target-direction-muted -oui-mt-1"
                      size={14}
                      color="inherit"
                      style={{
                        animation:
                          "oui-prediction-target-pulse 1.2s ease-in-out infinite",
                      }}
                    />
                  </>
                )}
              </span>
            )}
          </div>
        )}
        <div
          ref={xLabelsRef}
          className="oui-pointer-events-none oui-absolute oui-bottom-14 oui-start-4 oui-z-10 oui-h-8 oui-text-xs oui-tabular-nums oui-text-base-contrast-36"
          style={{ width: `calc((100% - 32px) * ${plotWidth / width})` }}
        >
          {visibleXTicks.map(({ timestamp, ratio }) => (
            <span
              key={timestamp}
              className="oui-absolute oui-top-2 -oui-translate-x-1/2 oui-whitespace-nowrap"
              style={{ left: `${ratio * 100}%` }}
            >
              {(isPastRound || chartMode === "candles"
                ? intl.roundTimeFormatter
                : intl.chartTimeFormatter
              ).format(new Date(timestamp))}
            </span>
          ))}
        </div>
        {chartPoints.length === 0 && chartCandles.length === 0 && (
          <div className="oui-pointer-events-none oui-absolute oui-inset-x-4 oui-bottom-20 oui-top-[var(--oui-prediction-chart-top)] oui-flex oui-items-center oui-justify-center oui-text-sm oui-text-base-contrast-36">
            {t("prediction.noData")}
          </div>
        )}
      </>
      <RoundNavigator
        intervalSeconds={intervalSeconds}
        round={round}
        now={now}
        rows={rows}
        selectedRound={selectedRound}
        onRoundChange={onSelectRound}
        chartMode={chartMode}
        onChartModeChange={(mode) => {
          setChartMode(mode);
          setHoveredPoint(null);
        }}
        roundOutcome={roundOutcome}
      />
    </div>
  );
};
