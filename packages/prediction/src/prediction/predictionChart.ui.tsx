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
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import type {
  PredictionChartPoint,
  PredictionOutcome,
  PredictionRoundPhase,
} from "./prediction.script";
import {
  CANDLE_INTERVAL_MS,
  CANDLE_TICK_INTERVAL_MS,
  CANDLE_WINDOW_MS,
  createMockCandleHistory,
  getHistoricalRoundOutcome,
  usePredictionCandles,
  type PredictionCandle,
} from "./predictionChart.script";
import {
  formatCountdown,
  formatCountdownWithHours,
  ROUND_INTERVAL_SECONDS,
  toIntlLocale,
  usePredictionFormatters,
} from "./predictionShared";

type PredictionChartMode = "price" | "candles";

/** Rounds listed in the "Past" menu (≈24h of history, excluding the live round). */
const PAST_MENU_ROUNDS = 287;

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
      <span className="oui-prediction-countdown-label oui-hidden oui-text-sm oui-font-medium oui-text-base-contrast-54 xl:oui-inline">
        {label}
      </span>
      <span className="oui-flex oui-items-center oui-gap-1 oui-text-xl oui-font-semibold oui-tabular-nums oui-text-base-contrast">
        <span className="oui-min-w-10 oui-rounded-md oui-bg-base-7 oui-px-2 oui-py-1 oui-text-center">
          {minutes}
        </span>
        <span className="oui-text-base-contrast-54">:</span>
        <span className="oui-min-w-10 oui-rounded-md oui-bg-base-7 oui-px-2 oui-py-1 oui-text-center">
          {remainingSeconds}
        </span>
      </span>
    </span>
  );
};

type ChartFormatters = ReturnType<typeof usePredictionFormatters>["chart"];

const formatRoundLabel = (
  round: number,
  todayLabel: string,
  liveRound: number,
  chart: ChartFormatters,
) => {
  const resolutionTime = new Date((round + ROUND_INTERVAL_SECONDS) * 1_000);
  const today = new Date((liveRound + ROUND_INTERVAL_SECONDS) * 1_000);
  const isToday =
    resolutionTime.getFullYear() === today.getFullYear() &&
    resolutionTime.getMonth() === today.getMonth() &&
    resolutionTime.getDate() === today.getDate();
  return `${chart.roundTimeFormatter.format(resolutionTime)} ${
    isToday ? todayLabel : chart.roundLabelFormatter.format(resolutionTime)
  }`;
};

const formatRoundTime = (round: number, chart: ChartFormatters) =>
  chart.roundTimeFormatter.format(
    new Date((round + ROUND_INTERVAL_SECONDS) * 1_000),
  );

const RoundNavigator: React.FC<{
  round: number;
  countdown: number;
  roundPhase: PredictionRoundPhase;
  selectedRound: number;
  onRoundChange: (round: number) => void;
  chartMode: PredictionChartMode;
  onChartModeChange: (mode: PredictionChartMode) => void;
}> = ({
  round,
  countdown,
  roundPhase,
  selectedRound,
  onRoundChange,
  chartMode,
  onChartModeChange,
}) => {
  const { t } = useTranslation();
  const { chart } = usePredictionFormatters();
  const [menu, setMenu] = useState<"past" | "more" | null>(null);
  const pastMenuRef = useRef<HTMLDivElement>(null);

  const recentRounds = [5, 4, 3, 2].map(
    (multiplier) => round - multiplier * ROUND_INTERVAL_SECONDS,
  );
  // Keep the live market centred by default. Once a historical or upcoming
  // market is selected, anchor the visible sequence to that selection so the
  // selected market is always the first round in chronological order.
  const visibleRounds =
    selectedRound === round
      ? [round - ROUND_INTERVAL_SECONDS, round, round + ROUND_INTERVAL_SECONDS]
      : [
          selectedRound,
          selectedRound + ROUND_INTERVAL_SECONDS,
          selectedRound + 2 * ROUND_INTERVAL_SECONDS,
        ];
  const menuRounds = useMemo(() => {
    if (menu === "past") {
      return Array.from(
        { length: PAST_MENU_ROUNDS },
        (_, index) =>
          round - (PAST_MENU_ROUNDS + 1 - index) * ROUND_INTERVAL_SECONDS,
      );
    }

    return Array.from(
      { length: 8 },
      (_, index) => round + (index + 2) * ROUND_INTERVAL_SECONDS,
    );
  }, [menu, round]);

  useEffect(() => {
    if (menu !== "past") return;
    const pastMenu = pastMenuRef.current;
    if (pastMenu) pastMenu.scrollTop = pastMenu.scrollHeight;
  }, [menu]);

  const status = (itemRound: number) => {
    if (itemRound < round) return "ended";
    if (itemRound === round) {
      return selectedRound === round &&
        (roundPhase === "resolvedUp" ||
          roundPhase === "resolvedDown" ||
          roundPhase === "void")
        ? "ended"
        : "live";
    }
    return "upcoming";
  };

  const result = (itemRound: number): PredictionOutcome => {
    if (itemRound === selectedRound && roundPhase === "resolvedUp") return "up";
    if (itemRound === selectedRound && roundPhase === "resolvedDown")
      return "down";
    return getHistoricalRoundOutcome(itemRound);
  };

  const renderRoundTooltip = (itemRound: number) => {
    const itemStatus = status(itemRound);
    const itemResult = result(itemRound);
    const upcomingCountdown =
      countdown + Math.max(itemRound - round - ROUND_INTERVAL_SECONDS, 0);
    return (
      <div className="oui-w-64 oui-p-2">
        <div className="oui-flex oui-items-center oui-justify-between oui-text-sm oui-font-semibold oui-text-base-contrast">
          <span className="oui-flex oui-items-center oui-gap-2">
            {itemStatus === "live" && <LiveIndicator />}
            {t(`prediction.rounds.${itemStatus}`)}
          </span>
          {itemStatus === "ended" ? (
            <span
              className={cn(
                "oui-flex oui-items-center oui-gap-1",
                itemResult === "up"
                  ? "oui-text-trade-profit"
                  : "oui-text-trade-loss",
              )}
            >
              <span
                className={cn(
                  "oui-flex oui-size-5 oui-items-center oui-justify-center oui-rounded-full",
                  itemResult === "up"
                    ? "oui-bg-trade-profit/15"
                    : "oui-bg-trade-loss/15",
                )}
              >
                {itemResult === "up" ? (
                  <CaretUpIcon size={12} color="inherit" opacity={1} />
                ) : (
                  <CaretDownIcon size={12} color="inherit" opacity={1} />
                )}
              </span>
              {t(`prediction.${itemResult}`)}
            </span>
          ) : (
            <span className="oui-tabular-nums">
              {formatCountdownWithHours(
                itemStatus === "live" ? countdown : upcomingCountdown,
              )}
            </span>
          )}
        </div>
        <div className="oui-mt-4 oui-text-xs oui-text-base-contrast-54">
          {t("prediction.rounds.resolutionTime")}
        </div>
        <div className="oui-mt-2 oui-grid oui-grid-cols-[56px_1fr] oui-gap-y-2 oui-text-xs">
          <span className="oui-text-base-contrast-54">
            {chart.localOffsetLabel}
          </span>
          <span className="oui-text-end oui-text-base-contrast">
            {chart.resolutionLocalFormatter.format(
              new Date((itemRound + ROUND_INTERVAL_SECONDS) * 1_000),
            )}
          </span>
          <span className="oui-text-base-contrast-54">UTC</span>
          <span className="oui-text-end oui-text-base-contrast">
            {chart.resolutionUtcFormatter.format(
              new Date((itemRound + ROUND_INTERVAL_SECONDS) * 1_000),
            )}
          </span>
        </div>
      </div>
    );
  };

  const renderMenuRounds = () =>
    menuRounds.map((itemRound) => {
      const itemStatus = status(itemRound);
      const itemResult = result(itemRound);
      return (
        <Tooltip
          key={itemRound}
          content={renderRoundTooltip(itemRound)}
          side="right"
          sideOffset={8}
          className="oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
          arrow={{ className: "oui-fill-base-5" }}
        >
          <button
            type="button"
            onClick={() => {
              onRoundChange(itemRound);
              setMenu(null);
            }}
            className={cn(
              "oui-flex oui-w-full oui-items-center oui-gap-2 oui-rounded-lg oui-px-3 oui-py-2.5 oui-text-start oui-text-xs hover:oui-bg-base-6 hover:oui-text-base-contrast",
              selectedRound === itemRound
                ? "oui-bg-base-6 oui-text-base-contrast"
                : "oui-text-base-contrast-54",
            )}
          >
            {itemStatus === "ended" ? (
              <span
                className={cn(
                  "oui-flex oui-h-5 oui-w-5 oui-items-center oui-justify-center oui-rounded-full oui-text-3xs",
                  itemResult === "up"
                    ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                    : "oui-bg-trade-loss/15 oui-text-trade-loss",
                )}
              >
                {itemResult === "up" ? (
                  <CaretUpIcon size={12} color="inherit" opacity={1} />
                ) : (
                  <CaretDownIcon size={12} color="inherit" opacity={1} />
                )}
              </span>
            ) : (
              <span className="oui-h-1.5 oui-w-1.5 oui-rounded-full oui-bg-base-contrast-36" />
            )}
            {formatRoundLabel(
              itemRound,
              t("prediction.rounds.today"),
              round,
              chart,
            )}
          </button>
        </Tooltip>
      );
    });

  return (
    <div className="oui-absolute oui-inset-x-0 oui-bottom-0 oui-z-20 oui-flex oui-h-14 oui-items-center oui-gap-2 oui-border-t oui-border-line-6 oui-bg-base-9 oui-px-3">
      <div className="oui-relative oui-flex oui-min-w-0 oui-flex-1 oui-items-center oui-justify-start oui-gap-2 oui-overflow-x-auto oui-hide-scrollbar">
        <PopoverRoot
          open={menu === "past"}
          onOpenChange={(open) => setMenu(open ? "past" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="oui-flex oui-shrink-0 oui-items-center oui-gap-3 oui-rounded-full oui-bg-base-7 oui-px-3 oui-py-2 oui-text-xs oui-text-base-contrast-54 hover:oui-text-base-contrast"
            >
              <span className="oui-flex oui-items-center oui-gap-1">
                {t("prediction.rounds.past")}
                {menu === "past" ? (
                  <CaretUpIcon size={14} color="inherit" />
                ) : (
                  <CaretDownIcon size={14} color="inherit" />
                )}
              </span>
              <span className="oui-hidden oui-h-5 oui-w-px oui-bg-line-12 xl:oui-block" />
              <span className="oui-hidden oui-items-center oui-gap-1.5 xl:oui-flex">
                {recentRounds.map((itemRound) => {
                  const itemResult = result(itemRound);
                  return (
                    <Tooltip
                      key={itemRound}
                      content={renderRoundTooltip(itemRound)}
                      side="top"
                      sideOffset={8}
                      className="oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
                      arrow={{ className: "oui-fill-base-5" }}
                    >
                      <span
                        className={cn(
                          "oui-flex oui-h-5 oui-w-5 oui-items-center oui-justify-center oui-rounded-full oui-text-[8px]",
                          itemResult === "up"
                            ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                            : "oui-bg-trade-loss/15 oui-text-trade-loss",
                        )}
                      >
                        {itemResult === "up" ? (
                          <CaretUpIcon size={12} color="inherit" opacity={1} />
                        ) : (
                          <CaretDownIcon
                            size={12}
                            color="inherit"
                            opacity={1}
                          />
                        )}
                      </span>
                    </Tooltip>
                  );
                })}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            ref={pastMenuRef}
            align="start"
            side="top"
            sideOffset={8}
            className="oui-max-h-72 oui-w-56 oui-overflow-y-auto oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
          >
            {renderMenuRounds()}
          </PopoverContent>
        </PopoverRoot>

        {visibleRounds.map((itemRound) => {
          const itemStatus = status(itemRound);
          return (
            <div
              key={itemRound}
              className={cn(
                "oui-relative",
                itemStatus !== "live" && "oui-hidden xl:oui-block",
              )}
            >
              <Tooltip
                content={renderRoundTooltip(itemRound)}
                side="top"
                sideOffset={8}
                className="oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
                arrow={{ className: "oui-fill-base-5" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onRoundChange(itemRound);
                    setMenu(null);
                  }}
                  className={cn(
                    "oui-prediction-roundNavigator-round-btn oui-relative oui-isolate oui-flex oui-shrink-0 oui-items-center oui-gap-2 oui-rounded-full oui-border oui-px-4 oui-py-2 oui-text-xs oui-transition-colors",
                    selectedRound === itemRound
                      ? "oui-border-transparent oui-bg-base-5 oui-text-base-contrast"
                      : "oui-border-transparent oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-5",
                  )}
                >
                  {itemStatus === "live" && <LiveIndicator />}
                  {formatRoundTime(itemRound, chart)}
                </button>
              </Tooltip>
            </div>
          );
        })}

        <PopoverRoot
          open={menu === "more"}
          onOpenChange={(open) => setMenu(open ? "more" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="oui-shrink-0 oui-rounded-full oui-bg-base-7 oui-px-4 oui-py-2 oui-text-xs oui-text-base-contrast-54 hover:oui-text-base-contrast"
            >
              <span className="oui-flex oui-items-center oui-gap-1">
                {t("prediction.rounds.more")}
                {menu === "more" ? (
                  <CaretUpIcon size={14} color="inherit" />
                ) : (
                  <CaretDownIcon size={14} color="inherit" />
                )}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="top"
            sideOffset={8}
            className="oui-max-h-72 oui-w-56 oui-overflow-y-auto oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
          >
            {renderMenuRounds()}
          </PopoverContent>
        </PopoverRoot>
      </div>

      <div className="oui-flex oui-items-center oui-gap-1 oui-rounded-lg oui-bg-base-10 oui-p-1">
        <button
          type="button"
          aria-label={t("prediction.chart.priceMode")}
          aria-pressed={chartMode === "price"}
          onClick={() => onChartModeChange("price")}
          className={cn(
            "oui-flex oui-h-8 oui-w-8 oui-items-center oui-justify-center oui-rounded-md",
            chartMode === "price"
              ? "oui-bg-base-5 oui-text-primary"
              : "oui-text-base-contrast-36 hover:oui-text-base-contrast-80",
          )}
        >
          <AssetIcon />
        </button>
        <button
          type="button"
          aria-label={t("prediction.chart.chartMode")}
          aria-pressed={chartMode === "candles"}
          onClick={() => onChartModeChange("candles")}
          className={cn(
            "oui-flex oui-h-8 oui-w-8 oui-items-center oui-justify-center oui-rounded-md",
            chartMode === "candles"
              ? "oui-bg-base-5 oui-text-primary"
              : "oui-text-base-contrast-36 hover:oui-text-base-contrast-80",
          )}
        >
          <BarChartIcon />
        </button>
      </div>
    </div>
  );
};

export const PriceChart: React.FC<{
  selectedRound: number;
  onSelectRound: (round: number) => void;
  points: PredictionChartPoint[];
  openingPrice: number;
  currentPrice: number;
  round: number;
  countdown: number;
  roundPhase: PredictionRoundPhase;
  onGoToLiveMarket: () => void;
}> = ({
  selectedRound,
  onSelectRound,
  points,
  openingPrice,
  currentPrice,
  round,
  countdown,
  roundPhase,
  onGoToLiveMarket,
}) => {
  const { t } = useTranslation();
  const { chart: intl, formatUsd, locale } = usePredictionFormatters();
  const [chartMode, setChartMode] = useState<PredictionChartMode>("price");
  const liveCandles = usePredictionCandles(currentPrice, round);
  const [frozenChart, setFrozenChart] = useState<{
    points: PredictionChartPoint[];
    candles: PredictionCandle[];
    openingPrice: number;
    currentPrice: number;
  } | null>(null);
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
    setFrozenChart(null);
    setHoveredPoint(null);
  }, [round]);

  useEffect(() => {
    if (selectedRound < round) {
      const endTimestamp = (selectedRound + ROUND_INTERVAL_SECONDS) * 1_000;
      const historicalCandles = createMockCandleHistory(
        currentPrice,
        endTimestamp,
      );
      setFrozenChart({
        points: historicalCandles.map((candle) => ({
          timestamp: candle.timestamp,
          price: candle.close,
        })),
        candles: historicalCandles,
        openingPrice,
        currentPrice,
      });
    } else {
      setFrozenChart(null);
    }
  }, [selectedRound, round]);

  const isPastRound = selectedRound < round;
  const isFutureRound = selectedRound > round;
  const liveTimestamp = (round + ROUND_INTERVAL_SECONDS - countdown) * 1_000;
  const alignedLiveCandles = useMemo(() => {
    // Keep candles on whole minutes so the axis labels don't flicker when
    // the round clock drifts a few hundred ms from the wall clock.
    const offset =
      Math.round(
        (liveTimestamp - (points.at(-1)?.timestamp ?? liveTimestamp)) /
          CANDLE_INTERVAL_MS,
      ) * CANDLE_INTERVAL_MS;
    return liveCandles.map((candle) => ({
      ...candle,
      timestamp: candle.timestamp + offset,
    }));
  }, [liveCandles, points, liveTimestamp]);
  const chartPoints = useMemo(() => {
    if (isPastRound) return frozenChart?.points ?? [];
    const offset = liveTimestamp - (points.at(-1)?.timestamp ?? liveTimestamp);
    const alignedPoints = points.map((point) => ({
      ...point,
      timestamp: point.timestamp + offset,
    }));
    return [
      ...alignedLiveCandles
        .filter(
          (candle) =>
            candle.timestamp < (alignedPoints[0]?.timestamp ?? liveTimestamp),
        )
        .map((candle) => ({
          timestamp: candle.timestamp,
          price: candle.close,
        })),
      ...alignedPoints,
    ];
  }, [isPastRound, frozenChart, points, liveTimestamp, alignedLiveCandles]);
  const chartCandles = isPastRound
    ? (frozenChart?.candles ?? [])
    : alignedLiveCandles;
  const chartOpeningPrice =
    isPastRound && frozenChart ? frozenChart.openingPrice : openingPrice;
  const chartCurrentPrice =
    isPastRound && frozenChart ? frozenChart.currentPrice : currentPrice;
  const futureCountdown =
    countdown + Math.max(selectedRound - round - ROUND_INTERVAL_SECONDS, 0);

  const chart = useMemo(() => {
    const isCandleMode = chartMode === "candles";
    const roundEnd = (selectedRound + ROUND_INTERVAL_SECONDS) * 1_000;
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
        ? 300_000
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
    const firstVisiblePoint = visiblePoints[0];
    const previousPoint = [...chartPoints]
      .reverse()
      .find((point) => point.timestamp < windowStart);
    if (
      firstVisiblePoint &&
      previousPoint &&
      firstVisiblePoint.timestamp > windowStart
    ) {
      const boundaryPrice = new Decimal(firstVisiblePoint.price)
        .sub(previousPoint.price)
        .mul(windowStart - previousPoint.timestamp)
        .div(firstVisiblePoint.timestamp - previousPoint.timestamp)
        .add(previousPoint.price)
        .toNumber();
      visiblePoints.unshift({ timestamp: windowStart, price: boundaryPrice });
    }
    const activeWindowDuration = Math.max(windowEnd - windowStart, 1);
    const values = [
      ...visiblePoints.map((point) => point.price),
      ...visibleCandles.flatMap((candle) => [candle.high, candle.low]),
      ...(isFutureRound ? [] : [chartOpeningPrice]),
      chartCurrentPrice,
    ];
    const rawMinimum = Math.min(...values);
    const rawMaximum = Math.max(...values);
    const padding = Math.max(
      (rawMaximum - rawMinimum) * 0.15,
      Math.abs(chartCurrentPrice) * 0.0001,
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
    const getY = (price: number) =>
      plotHeight - ((price - minimum) / range) * plotHeight;
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

  const isUp = chartCurrentPrice >= chartOpeningPrice;
  const liveTargetDirection =
    selectedRound !== round || chartCurrentPrice === chartOpeningPrice
      ? null
      : chartCurrentPrice > chartOpeningPrice
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
        .oui-prediction-priceChart { --oui-prediction-chart-top: 190px; }
        @media (min-width: 480px) {
          .oui-prediction-priceChart { --oui-prediction-chart-top: 140px; }
        }
        @media (min-width: 768px) {
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
      {/* flex-wrap lets the countdown / go-to-live action drop to its own row
          instead of squeezing the price stats off-card on narrow screens.
          z-30 stays above the chart hover layer (z-20 @ top-20) so a wrapped
          go-to-live button remains clickable on narrow screens. */}
      <div className="oui-relative oui-z-30 oui-flex oui-flex-wrap oui-items-center oui-gap-x-4 oui-gap-y-2 2xl:oui-gap-x-8">
        <div className="oui-flex-none">
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
          <div className="oui-mt-1 oui-text-xl oui-font-semibold oui-tabular-nums oui-text-base-contrast-54">
            {isFutureRound ? "--" : `$${formatUsd(chartOpeningPrice)}`}
          </div>
        </div>
        <div className="oui-min-w-0">
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
                "oui-whitespace-nowrap oui-text-xl oui-font-semibold oui-tabular-nums",
                isPastRound ? "oui-text-base-contrast" : "oui-text-primary",
              )}
            >
              ${formatUsd(chartCurrentPrice)}
            </span>
            {!isFutureRound && (
              <span
                className={cn(
                  "oui-whitespace-nowrap oui-text-xs oui-tabular-nums",
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
                ${formatUsd(Math.abs(chartCurrentPrice - chartOpeningPrice))}
                {" ("}
                {chartOpeningPrice > 0
                  ? `${isUp ? "+" : ""}${new Decimal(chartCurrentPrice).sub(chartOpeningPrice).div(chartOpeningPrice).mul(100).toFixed(2)}%`
                  : "--"}
                {")"}
              </span>
            )}
          </div>
        </div>
        {selectedRound === round &&
        (roundPhase === "trading" || roundPhase === "closingSoon") ? (
          <div className="oui-ms-auto oui-flex-none">
            <CountdownDisplay
              seconds={countdown}
              label={t("prediction.rounds.endsIn")}
            />
          </div>
        ) : selectedRound === round ? (
          <button
            type="button"
            onClick={onGoToLiveMarket}
            className="oui-ms-auto oui-flex oui-flex-none oui-items-center oui-gap-2 oui-rounded-full oui-bg-base-7 oui-px-3 oui-py-2 oui-text-xs oui-text-base-contrast-80 hover:oui-bg-base-6 hover:oui-text-base-contrast"
          >
            <LiveIndicator />
            {t("prediction.rounds.goToLiveMarket")}
            <ChevronRightIcon size={14} color="inherit" />
          </button>
        ) : isFutureRound ? (
          <div className="oui-ms-auto oui-flex-none">
            <CountdownDisplay
              seconds={futureCountdown}
              label={t("prediction.rounds.startsIn")}
              mutedIcon
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSelectRound(round)}
            className="oui-ms-auto oui-flex oui-flex-none oui-items-center oui-gap-2 oui-rounded-full oui-bg-base-7 oui-px-3 oui-py-2 oui-text-xs oui-text-base-contrast-80 hover:oui-bg-base-6 hover:oui-text-base-contrast"
          >
            <LiveIndicator />
            {t("prediction.rounds.goToLiveMarket")}
            <ChevronRightIcon size={14} color="inherit" />
          </button>
        )}
      </div>
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
        aria-label={t("prediction.chart.ariaLabel")}
      >
        {chart.yTicks.map(({ ratio }) => (
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
        ))}
        {!isFutureRound && (
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
        {!isFutureRound && (
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
      {chart.yTicks.map(({ ratio, value }) => (
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
      ))}
      {!isFutureRound && (
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
      <RoundNavigator
        round={round}
        countdown={countdown}
        roundPhase={roundPhase}
        selectedRound={selectedRound}
        onRoundChange={onSelectRound}
        chartMode={chartMode}
        onChartModeChange={(mode) => {
          setChartMode(mode);
          setHoveredPoint(null);
        }}
      />
    </div>
  );
};
