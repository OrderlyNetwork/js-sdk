import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  AssetIcon,
  BarChartIcon,
  CaretDownIcon,
  CaretUpIcon,
  cn,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Tooltip,
  useMediaQuery,
  useScreen,
} from "@orderly.network/ui";
import { binaryRowRoundStart, type BinaryInfoRow } from "./binary/binaryInfo";
import {
  getRoundNavigation,
  getRoundStatus,
  secondsUntil,
} from "./binary/binaryRoundView";
import type { PredictionResult } from "./prediction.types";
import type {
  PredictionChartMode,
  RoundOutcomeLookup,
} from "./predictionChart.script";
import { resultLabels, roundStatusLabels } from "./predictionLabels";
import {
  formatCountdown,
  formatCountdownWithHours,
  usePredictionFormatters,
} from "./predictionShared";

// Shared chart atoms: LiveIndicator and CountdownDisplay render inside both
// RoundNavigator and PriceChart (predictionChart.ui), which imports them from
// this file to keep the dependency one-directional.

export const LiveIndicator = () => (
  <span className="oui-prediction-liveIndicator oui-relative oui-inline-flex oui-size-3 oui-flex-none oui-items-center oui-justify-center">
    <span className="oui-liveIndicator-pulse oui-absolute oui-inset-0 oui-animate-ping oui-rounded-full oui-bg-danger oui-opacity-75" />
    <span className="oui-liveIndicator-dot oui-relative oui-size-1.5 oui-rounded-full oui-bg-danger" />
  </span>
);

const RoundOutcomeIcon: React.FC<{ outcome?: PredictionResult }> = ({
  outcome,
}) => (
  <span
    className={cn(
      "oui-flex oui-size-5 oui-shrink-0 oui-items-center oui-justify-center oui-rounded-full",
      outcome === "up"
        ? "oui-bg-trade-profit/15 oui-text-trade-profit"
        : outcome === "down"
          ? "oui-bg-trade-loss/15 oui-text-trade-loss"
          : outcome === "tie"
            ? "oui-bg-base-contrast-12 oui-text-base-contrast"
            : "oui-text-base-contrast-36",
    )}
  >
    {outcome === "up" ? (
      <CaretUpIcon size={12} color="inherit" />
    ) : outcome === "down" ? (
      <CaretDownIcon size={12} color="inherit" />
    ) : outcome === "tie" ? (
      "="
    ) : (
      "--"
    )}
  </span>
);

export const CountdownDisplay: React.FC<{
  seconds: number;
  label: string;
  mutedIcon?: boolean;
  compact?: boolean;
}> = ({ seconds, label, mutedIcon = false, compact = false }) => {
  const [minutes, remainingSeconds] = formatCountdown(seconds).split(":");

  return (
    <span
      className={cn(
        "oui-flex oui-items-center oui-gap-2 oui-whitespace-nowrap",
        compact && "oui-gap-1 min-[480px]:oui-gap-2",
      )}
    >
      {mutedIcon ? (
        <span className="oui-prediction-countdown-dot oui-size-2 oui-flex-none oui-rounded-full oui-bg-base-contrast-36" />
      ) : (
        <LiveIndicator />
      )}
      <span
        className={cn(
          "oui-prediction-countdown-label oui-text-xs oui-font-medium oui-text-base-contrast-54",
          compact && "oui-text-2xs min-[480px]:oui-text-xs",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "oui-flex oui-items-center oui-gap-1 oui-text-xl oui-font-semibold oui-tabular-nums oui-text-base-contrast",
          compact && "oui-text-base min-[480px]:oui-text-xl",
        )}
      >
        <span
          className={cn(
            "oui-min-w-10 oui-rounded-lg oui-bg-base-7 oui-px-2 oui-py-1 oui-text-center",
            compact &&
              "oui-min-w-7 oui-px-1 min-[480px]:oui-min-w-10 min-[480px]:oui-px-2",
          )}
        >
          {minutes}
        </span>
        <span className="oui-text-base-contrast">:</span>
        <span
          className={cn(
            "oui-min-w-10 oui-rounded-lg oui-bg-base-7 oui-px-2 oui-py-1 oui-text-center",
            compact &&
              "oui-min-w-7 oui-px-1 min-[480px]:oui-min-w-10 min-[480px]:oui-px-2",
          )}
        >
          {remainingSeconds}
        </span>
      </span>
    </span>
  );
};

export const RoundNavigator: React.FC<{
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
  const { isMobile } = useScreen();
  const isWide = useMediaQuery("(min-width: 1280px)");
  const [menu, setMenu] = useState<"past" | "more" | null>(null);
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
  const menuRows = menu === "past" ? [...navigation.past].reverse() : future;
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
        <div className="oui-text-sm oui-flex oui-items-center oui-justify-between oui-gap-2 oui-text-base-contrast">
          <span className="oui-flex oui-items-center oui-gap-2">
            {status === "live" && <LiveIndicator />}
            {roundStatusLabels()[status]}
          </span>
          <span className="oui-tabular-nums">
            {status === "ended"
              ? outcome
                ? resultLabels()[outcome]
                : "--"
              : formatCountdownWithHours(secondsUntil(row.expire_at, now))}
          </span>
        </div>
        <div className="oui-text-xs oui-mt-4 oui-text-base-contrast-54">
          {t("prediction.rounds.resolutionTime")}
        </div>
        <div className="oui-text-xs oui-mt-2 oui-grid oui-grid-cols-[56px_1fr] oui-gap-y-2 oui-text-base-contrast">
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
          open={isMobile ? false : undefined}
          content={tooltip(row)}
          side="right"
          className="oui-rounded-xl oui-bg-base-5 oui-p-2"
        >
          <button
            type="button"
            onClick={() => select(row)}
            className={cn(
              "oui-text-xs oui-flex oui-w-full oui-items-center oui-gap-2 oui-rounded-lg oui-px-3 oui-py-2.5 oui-text-start hover:oui-bg-base-6",
              binaryRowRoundStart(row) === selectedRound
                ? "oui-bg-base-6 oui-text-base-contrast"
                : "oui-text-base-contrast-54",
            )}
          >
            {getRoundStatus(row, now) === "ended" ? (
              <RoundOutcomeIcon
                outcome={roundOutcome(binaryRowRoundStart(row))}
              />
            ) : (
              <span className="oui-size-1.5 oui-rounded-full oui-bg-base-contrast-36" />
            )}
            {formatLabel(row)}
          </button>
        </Tooltip>
      ))}
    </>
  );
  return (
    <div className="oui-absolute oui-inset-x-0 oui-bottom-0 oui-z-20 oui-flex oui-h-14 oui-items-center oui-gap-2 oui-border-t oui-border-line-6 oui-bg-base-9 oui-px-3">
      <div className="oui-hide-scrollbar oui-flex oui-min-w-0 oui-flex-1 oui-items-center oui-gap-2 oui-overflow-x-auto">
        <PopoverRoot
          open={menu === "past"}
          onOpenChange={(open) => setMenu(open ? "past" : null)}
        >
          <div className="oui-text-xs oui-flex oui-shrink-0 oui-items-center oui-gap-2 oui-rounded-full oui-bg-base-7 oui-px-3 oui-py-2 oui-text-base-contrast-54">
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={navigation.past.length === 0}
                className="disabled:oui-opacity-36 oui-flex oui-items-center oui-gap-2"
              >
                {t("prediction.rounds.past")}
                <CaretDownIcon size={14} color="inherit" />
              </button>
            </PopoverTrigger>
            <div className="oui-hidden oui-items-center oui-gap-1.5 2xl:oui-flex">
              {recent.map((row) => {
                const result = roundOutcome(binaryRowRoundStart(row));
                const icon = <RoundOutcomeIcon outcome={result} />;
                return (
                  <Tooltip
                    key={row.symbol}
                    open={isMobile ? false : undefined}
                    content={tooltip(row)}
                    className="oui-rounded-xl oui-bg-base-5 oui-p-2"
                  >
                    <button
                      type="button"
                      aria-label={formatLabel(row)}
                      aria-pressed={binaryRowRoundStart(row) === selectedRound}
                      onClick={() => select(row)}
                      className="oui-prediction-roundNavigator-result-btn oui-rounded-full hover:oui-bg-base-6"
                    >
                      {icon}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
          <PopoverContent
            align="start"
            side="top"
            sideOffset={8}
            className="oui-custom-scrollbar oui-max-h-72 oui-w-56 oui-overflow-y-auto oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
          >
            {renderMenu()}
          </PopoverContent>
        </PopoverRoot>
        {navigation.visible.map((row) =>
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
                open={isMobile ? false : undefined}
                content={tooltip(row)}
                side="top"
                className="oui-rounded-xl oui-bg-base-5 oui-p-2"
              >
                <button
                  type="button"
                  onClick={() => select(row)}
                  className={cn(
                    "oui-prediction-roundNavigator-round-btn oui-text-xs oui-flex oui-shrink-0 oui-items-center oui-gap-2 oui-rounded-full oui-px-4 oui-py-2",
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
          ) : null,
        )}
        {future.length > 0 && (
          <PopoverRoot
            open={menu === "more"}
            onOpenChange={(open) => setMenu(open ? "more" : null)}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={future.length === 0}
                className="disabled:oui-opacity-36 oui-text-xs oui-flex oui-shrink-0 oui-items-center oui-gap-1 oui-rounded-full oui-bg-base-7 oui-px-3 oui-py-2 oui-text-base-contrast-54"
              >
                {t("prediction.rounds.more")}
                <CaretDownIcon size={14} color="inherit" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              sideOffset={8}
              className="oui-custom-scrollbar oui-max-h-72 oui-w-56 oui-overflow-y-auto oui-rounded-xl oui-bg-base-5 oui-p-2 oui-shadow-xl"
            >
              {renderMenu()}
            </PopoverContent>
          </PopoverRoot>
        )}
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
