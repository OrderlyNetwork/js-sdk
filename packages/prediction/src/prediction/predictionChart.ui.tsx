import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  CaretDownIcon,
  CaretUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  cn,
  parseNumber,
  Tooltip,
} from "@orderly.network/ui";
import type { BinaryInfoRow } from "./binary/binaryInfo";
import {
  getPriceDifference,
  getRoundPrices,
  getRoundStatus,
  secondsUntil,
} from "./binary/binaryRoundView";
import { computeChartGeometry, type CandleScale } from "./chartGeometry";
import { formatChartPriceDifferencePercent } from "./chartPriceDifferenceFormat";
import { useRoundNow } from "./hooks/useRoundCountdown";
import type { PredictionChartPoint } from "./prediction.types";
import {
  type PredictionCandle,
  type PredictionChartMode,
  type RoundOutcomeLookup,
} from "./predictionChart.script";
import {
  useIndexPriceFormatter,
  usePredictionFormatters,
} from "./predictionShared";
import {
  CountdownDisplay,
  LiveIndicator,
  RoundNavigator,
} from "./roundNavigator.ui";

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
  isRoundUnavailable?: boolean;
  canGoToLiveMarket?: boolean;
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
  isRoundUnavailable = false,
  canGoToLiveMarket,
}) => {
  const { t } = useTranslation();
  const { chart: intl } = usePredictionFormatters();
  const indexPrice = useIndexPriceFormatter(selectedRow?.index_price_symbol);
  // All visible round clocks use one calibrated leaf-local heartbeat.
  const now = useRoundNow(
    Math.max(selectedRow?.expire_at ?? 0, ...rows.map((row) => row.expire_at)),
  );
  const countdown = selectedRow ? secondsUntil(selectedRow.expire_at, now) : 0;
  const [chartMode, setChartMode] = useState<PredictionChartMode>("price");
  const status = selectedRow
    ? getRoundStatus(selectedRow, now)
    : isRoundUnavailable
      ? "ended"
      : undefined;
  const isPastRound = status === "ended";
  const isFutureRound = status === "upcoming";
  // "Go to live market" only makes sense while the market still has an
  // ACTIVE unexpired round to jump to.
  const hasLiveOrUpcomingRow = rows.some(
    (row) => row.status === "ACTIVE" && row.expire_at > now,
  );

  const [hoveredPoint, setHoveredPoint] = useState<
    (PredictionChartPoint & { xRatio: number; yRatio: number }) | null
  >(null);
  const width = 720;
  const height = 230;
  const plotWidth = 650;
  const plotHeight = height;
  const windowDuration = 60 * 60 * 1_000;
  // Sticky candle y-axis scale kept as state: the pure geometry pass in
  // chartGeometry decides between the cached scale and a fresh one, and the
  // render-phase adjustment below persists its choice without touching refs
  // during render.
  const [candleScale, setCandleScale] = useState<CandleScale | undefined>();
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

  // Reset hover via the render-phase adjustment pattern rather than an
  // effect: clearing on round change needs no post-paint pass.
  const [hoveredRound, setHoveredRound] = useState(selectedRound);
  if (hoveredRound !== selectedRound) {
    setHoveredRound(selectedRound);
    setHoveredPoint(null);
  }
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

  const chart = useMemo(
    () =>
      computeChartGeometry({
        chartMode,
        selectedRound,
        selectedRow,
        isPastRound,
        isFutureRound,
        intervalSeconds,
        now: liveTimestamp,
        candles: chartCandles,
        points: chartPoints,
        openingPrice: chartOpeningPrice,
        currentPrice: chartCurrentPrice,
        cachedScale: candleScale,
        width,
        height,
        plotWidth,
        plotHeight,
        windowDuration,
      }),
    [
      candleScale,
      chartCandles,
      chartCurrentPrice,
      chartMode,
      chartOpeningPrice,
      chartPoints,
      isFutureRound,
      selectedRound,
      isPastRound,
      liveTimestamp,
      selectedRow,
      intervalSeconds,
    ],
  );
  // Documented render-phase state adjustment (react.dev, "adjusting some
  // state when a prop changes"): identity equality with the persisted scale
  // is the no-update signal, and the keep-range logic guarantees the second
  // pass reuses the cached object, so this converges without an effect.
  if (chart.nextCandleScale !== candleScale) {
    setCandleScale(chart.nextCandleScale);
  }

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
    <div className="oui-prediction-priceChart oui-relative oui-h-[470px] oui-overflow-hidden oui-rounded-xl oui-bg-base-9 oui-p-4 md:oui-h-[420px] lg:oui-h-[360px] 2xl:oui-h-[calc(100vh-330px)] 2xl:oui-max-h-[640px] 2xl:oui-min-h-[480px]">
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
        <div className="oui-w-full min-[390px]:oui-w-auto min-[390px]:oui-flex-none">
          <Tooltip
            content={t("prediction.chart.priceToBeatHint")}
            className="oui-max-w-[330px] oui-bg-base-6"
            arrow={{ className: "oui-fill-base-6" }}
            delayDuration={300}
          >
            <span className="oui-text-xs oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12 oui-text-base-contrast-54">
              {t("prediction.chart.priceToBeat")}
            </span>
          </Tooltip>
          <div className="oui-mt-1 oui-text-base oui-font-semibold oui-tabular-nums oui-text-base-contrast-54 min-[430px]:oui-text-xl">
            {chartOpeningPrice == null
              ? "--"
              : `$${indexPrice.format(chartOpeningPrice)}`}
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
              <span className="oui-text-xs oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12 oui-text-base-contrast-54">
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
                : `$${indexPrice.format(chartCurrentPrice)}`}
            </span>
            {!isFutureRound && difference && (
              <span
                className={cn(
                  "oui-text-2xs oui-whitespace-nowrap oui-tabular-nums min-[480px]:oui-text-xs",
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
                {`${difference.amount > 0 ? "+" : difference.amount < 0 ? "−" : ""}$${indexPrice.format(Math.abs(difference.amount))}`}
                {" ("}
                {formatChartPriceDifferencePercent(difference.percent)}
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
        <div className="oui-order-first oui-flex oui-w-full oui-items-center oui-justify-end oui-gap-2 min-[480px]:oui-gap-3 2xl:oui-order-none 2xl:oui-ms-auto 2xl:oui-w-auto 2xl:oui-flex-none">
          {status !== "live" &&
            (isRoundUnavailable || hasLiveOrUpcomingRow) && (
              <button
                type="button"
                onClick={onGoToLiveMarket}
                disabled={!(canGoToLiveMarket ?? hasLiveOrUpcomingRow)}
                className="oui-text-2xs oui-flex oui-min-w-0 oui-items-center oui-gap-1 oui-rounded-full oui-bg-base-7 oui-p-2 oui-text-base-contrast-80 min-[480px]:oui-text-sm 2xl:oui-text-xs enabled:hover:oui-bg-base-6 disabled:oui-cursor-not-allowed disabled:oui-opacity-40 min-[480px]:oui-gap-2 min-[480px]:oui-px-4 min-[480px]:oui-py-2.5 2xl:oui-px-3 2xl:oui-py-2"
              >
                <LiveIndicator />
                {t("prediction.rounds.goToLiveMarket")}
                <ChevronRightIcon size={14} color="inherit" />
              </button>
            )}
          {(isFutureRound || status === "live") && (
            <CountdownDisplay
              seconds={isFutureRound ? futureCountdown : countdown}
              label={t(
                isFutureRound
                  ? "prediction.rounds.startsIn"
                  : "prediction.rounds.endsIn",
              )}
              mutedIcon={isFutureRound}
              compact={isFutureRound && hasLiveOrUpcomingRow}
            />
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
                <div className="oui-text-sm oui-whitespace-nowrap oui-font-normal oui-tabular-nums oui-text-base-contrast-54">
                  {intl.chartHoverTimeFormatter.format(
                    new Date(hoveredPoint.timestamp),
                  )}
                </div>
                <div className="oui-mt-2 oui-whitespace-nowrap oui-text-base oui-font-semibold oui-tabular-nums oui-text-base-contrast">
                  ${indexPrice.format(hoveredPoint.price)}
                </div>
              </div>
            </>
          )}
        </div>
        {chartMode === "price" && chartPoints.length > 0 && (
          <span
            className={cn(
              "oui-pointer-events-none oui-absolute oui-z-10 oui-size-3 -oui-translate-x-1/2 -oui-translate-y-1/2 oui-rounded-full",
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
              className="oui-text-xs oui-pointer-events-none oui-absolute oui-end-4 oui-z-10 -oui-translate-y-1/2 oui-tabular-nums oui-text-base-contrast-36"
              style={{
                top: `calc(var(--oui-prediction-chart-top) + (100% - var(--oui-prediction-chart-top) - 88px) * ${ratio})`,
              }}
            >
              $
              {parseNumber(value, {
                rule: "price",
                dp: chart.yDecimals,
              })}
            </span>
          ),
        )}
        {!isFutureRound && chartOpeningPrice != null && (
          <div
            className="oui-text-xs oui-pointer-events-none oui-absolute oui-end-3 oui-z-10 oui-flex -oui-translate-y-1/2 oui-items-center oui-rounded-e-md oui-bg-base-3 oui-px-3 oui-py-1 oui-text-base-contrast"
            style={{
              top: `calc(var(--oui-prediction-chart-top) + (100% - var(--oui-prediction-chart-top) - 88px) * ${chart.openingRatio})`,
            }}
          >
            <span className="oui-absolute -oui-start-2 oui-top-1/2 -oui-translate-y-1/2 oui-border-y-[12px] oui-border-e-[10px] oui-border-y-transparent oui-border-e-base-3" />
            {t("prediction.chart.target")}
            {liveTargetDirection && (
              <span className="oui-prediction-target-direction oui-ms-1 oui-inline-flex oui-size-5 oui-flex-col oui-items-center oui-justify-center">
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
          className="oui-text-xs oui-pointer-events-none oui-absolute oui-bottom-14 oui-start-4 oui-z-10 oui-h-8 oui-tabular-nums oui-text-base-contrast-36"
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
          <div className="oui-text-sm oui-pointer-events-none oui-absolute oui-inset-x-4 oui-bottom-20 oui-top-[var(--oui-prediction-chart-top)] oui-flex oui-items-center oui-justify-center oui-text-base-contrast-36">
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
