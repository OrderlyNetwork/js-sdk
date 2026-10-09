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
} from "@orderly.network/ui";
import { binaryRowRoundStart, type BinaryInfoRow } from "./binary/binaryInfo";
import {
  getRoundNavigation,
  getRoundStatus,
  secondsUntil,
} from "./binary/binaryRoundView";
import type {
  PredictionChartMode,
  RoundOutcomeLookup,
} from "./predictionChart.script";
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

export const CountdownDisplay: React.FC<{
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
