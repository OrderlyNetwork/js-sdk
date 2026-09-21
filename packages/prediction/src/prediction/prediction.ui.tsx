import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage, usePositionStream } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import type { LocaleMessages } from "@orderly.network/i18n";
import {
  builtInTabs,
  DataItem,
  DropDownMarketsWidget,
  FavoritesIcon2,
  TriangleDownIcon,
  UnFavoritesIcon2,
  useMarketsContext,
} from "@orderly.network/markets";
import type { MarketTabConfig } from "@orderly.network/markets";
import { useDataTap } from "@orderly.network/react-app";
import {
  OrderBook as PerpOrderBook,
  PerpsPositionsPanel,
  PerpsPositionsSettings,
} from "@orderly.network/trading";
import { OrderStatus } from "@orderly.network/types";
import {
  AddCircleIcon,
  AssetIcon,
  Badge,
  BarChartIcon,
  Box,
  Button,
  CaretDownIcon,
  CaretUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  cn,
  DataTable,
  DataFilter,
  Divider,
  Input,
  inputFormatter,
  modal,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Select,
  Slider,
  Spinner,
  TabPanel,
  Tabs,
  TableFeatures,
  Text,
  Tips,
  TokenIcon,
  Tooltip,
  toast,
  useScreen,
} from "@orderly.network/ui";
import type { Column, DataFilterItem } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { SlippageUI } from "@orderly.network/ui-order-entry";
import {
  DesktopOrderList,
  TabType,
  useOrderColumn,
  useOrderListScript,
} from "@orderly.network/ui-orders";
import { PositionHistoryWidget } from "@orderly.network/ui-positions";
import { Decimal } from "@orderly.network/utils";
import type {
  PredictionChartPoint,
  PredictionDataTab,
  PredictionOutcome,
  PredictionPrototypeAuthState,
  PredictionPrototypeRegionState,
  PredictionRoundPhase,
  PredictionState,
} from "./prediction.script";
import {
  usePredictionFilters,
  predictionDateRange,
} from "./predictionFilters.script";

const usdFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const contractFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

const roundStartFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const roundEndFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

const roundBadgeDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
});

const roundBadgeTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const formatRoundTooltipCountdown = (seconds: number) => {
  const safeSeconds = Math.max(Math.floor(seconds), 0);
  const hours = Math.floor(safeSeconds / 3_600);
  const minutes = Math.floor((safeSeconds % 3_600) / 60);
  const remainingSeconds = safeSeconds % 60;
  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

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

const formatPercent = (value: number) => `${value.toFixed(1)}%`;
const formatContractPrice = (value: number) => value.toFixed(2);
const formatRoundWindow = (round: number) => {
  const start = new Date(round * 1_000);
  const end = new Date(start.getTime() + 5 * 60 * 1_000);
  const formattedEnd = roundEndFormatter
    .format(end)
    .replace(/ GMT([+-]\d+(?::\d+)?)$/, " (UTC$1)");
  return `${roundStartFormatter.format(start)} – ${formattedEnd}`;
};

const formatRoundBadge = (round: number) => {
  const end = new Date((round + 5 * 60) * 1_000);
  return `${roundBadgeDateFormatter.format(end)} ${roundBadgeTimeFormatter.format(end)}`;
};

const PREDICTION_MARKET_ID = "PREDICTION_BTC_UP_DOWN_5M";
// Prototype only: replace this independent storage with the shared favorite
// service once prediction markets are supported by the markets data source.
const PREDICTION_FAVORITES_STORAGE_KEY = "orderly_prediction_favorites";

const predictionMarketTab: MarketTabConfig = {
  id: "prediction",
  name: "Prediction",
  match: () => false,
};

const predictionMarketTabs: MarketTabConfig[] = [
  builtInTabs.favorites,
  builtInTabs.all,
  builtInTabs.crypto,
  predictionMarketTab,
  builtInTabs.rwa,
  builtInTabs.community,
  builtInTabs.newListing,
  builtInTabs.recent,
  builtInTabs.preTge,
];

const roundLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const roundListDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
});

const roundListTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const formatRoundListWindow = (round: number) => {
  const start = new Date(round * 1_000);
  const end = new Date((round + 5 * 60) * 1_000);
  return `${roundListDateFormatter.format(start)} · ${roundListTimeFormatter.format(start)}–${roundListTimeFormatter.format(end)}`;
};

const roundTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const chartTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

const chartHoverPriceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const formatChartHoverTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

type PredictionChartMode = "price" | "candles";

type PredictionCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

const CANDLE_INTERVAL_MS = 60_000;
const CANDLE_COUNT = 81;
const CANDLE_WINDOW_MS = 80 * 60_000;
const CANDLE_TICK_INTERVAL_MS = 7 * 60_000;

const createMockCandleHistory = (
  anchorPrice: number,
  endTimestamp = Date.now(),
  count = CANDLE_COUNT,
): PredictionCandle[] => {
  const end =
    Math.floor(endTimestamp / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;
  let previousClose = anchorPrice - 36;
  const candles = Array.from({ length: count }, (_, index) => {
    const timestamp = end - (count - 1 - index) * CANDLE_INTERVAL_MS;
    const open = previousClose;
    const move =
      Math.sin(index / 3.4) * 10 +
      Math.cos(index / 7.2) * 7 +
      Math.sin(index / 1.8) * 3;
    const close = open + move;
    const wick = 5 + Math.abs(Math.cos(index / 2.6)) * 9;
    previousClose = close;
    return {
      timestamp,
      open,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick * 0.82,
      close,
    };
  });
  const offset = anchorPrice - (candles.at(-1)?.close ?? anchorPrice);
  return candles.map((candle) => ({
    ...candle,
    open: candle.open + offset,
    high: candle.high + offset,
    low: candle.low + offset,
    close: candle.close + offset,
  }));
};

const rollLiveCandles = (
  candles: PredictionCandle[],
  price: number,
): PredictionCandle[] => {
  const lastCandle = candles.at(-1);
  if (!lastCandle) return createMockCandleHistory(price);

  const currentMinute =
    Math.floor(Date.now() / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;
  if (currentMinute > lastCandle.timestamp) {
    return [
      ...candles.slice(-(CANDLE_COUNT - 1)),
      {
        timestamp: currentMinute,
        open: lastCandle.close,
        high: Math.max(lastCandle.close, price),
        low: Math.min(lastCandle.close, price),
        close: price,
      },
    ];
  }

  const high = Math.max(lastCandle.high, price);
  const low = Math.min(lastCandle.low, price);
  if (
    high === lastCandle.high &&
    low === lastCandle.low &&
    price === lastCandle.close
  ) {
    return candles;
  }
  return [...candles.slice(0, -1), { ...lastCandle, high, low, close: price }];
};

const resolutionFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Taipei",
});

const resolutionUtcFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const formatRoundLabel = (
  round: number,
  todayLabel: string,
  liveRound: number,
) => {
  const resolutionTime = new Date((round + 5 * 60) * 1_000);
  const today = new Date((liveRound + 5 * 60) * 1_000);
  const isToday =
    resolutionTime.getFullYear() === today.getFullYear() &&
    resolutionTime.getMonth() === today.getMonth() &&
    resolutionTime.getDate() === today.getDate();
  return `${roundTimeFormatter.format(resolutionTime)} ${
    isToday ? todayLabel : roundLabelFormatter.format(resolutionTime)
  }`;
};

const formatRoundTime = (round: number) =>
  roundTimeFormatter.format(new Date((round + 5 * 60) * 1_000));

const tableTimeFormatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const formatTableTime = (timestamp: number) =>
  tableTimeFormatter.format(new Date(timestamp));

const TableNumber: React.FC<{
  value: number;
  dp?: number;
  prefix?: string;
  suffix?: string;
}> = ({ value, dp = 4, prefix, suffix }) => (
  <span className="oui-prediction-dataTable-number oui-whitespace-nowrap oui-tabular-nums">
    {prefix}
    <Text.numeral dp={dp} padding={false}>
      {value}
    </Text.numeral>
    {suffix && ` ${suffix}`}
  </span>
);

const OutcomeBadge: React.FC<{ outcome: PredictionOutcome }> = ({
  outcome,
}) => {
  const { t } = useTranslation();
  return (
    <Badge
      className="oui-prediction-outcomeBadge oui-uppercase"
      color={outcome === "up" ? "buy" : "sell"}
      size="xs"
    >
      {t(`prediction.${outcome}`)}
    </Badge>
  );
};

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
  const [menu, setMenu] = useState<"past" | "more" | null>(null);
  const pastMenuRef = useRef<HTMLDivElement>(null);

  const recentRounds = [round - 1_500, round - 1_200, round - 900, round - 600];
  // Keep the live market centred by default. Once a historical or upcoming
  // market is selected, anchor the visible sequence to that selection so the
  // selected market is always the first round in chronological order.
  const visibleRounds =
    selectedRound === round
      ? [round - 300, round, round + 300]
      : [selectedRound, selectedRound + 300, selectedRound + 600];
  const menuRounds = useMemo(() => {
    if (menu === "past") {
      return Array.from(
        { length: 287 },
        (_, index) => round - (288 - index) * 300,
      );
    }

    return Array.from({ length: 8 }, (_, index) => round + (index + 2) * 300);
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
    return Math.abs(Math.floor(itemRound / 300)) % 2 === 0 ? "up" : "down";
  };

  const renderRoundTooltip = (itemRound: number) => {
    const itemStatus = status(itemRound);
    const itemResult = result(itemRound);
    const upcomingCountdown = countdown + Math.max(itemRound - round - 300, 0);
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
              {formatRoundTooltipCountdown(
                itemStatus === "live" ? countdown : upcomingCountdown,
              )}
            </span>
          )}
        </div>
        <div className="oui-mt-4 oui-text-xs oui-text-base-contrast-54">
          {t("prediction.rounds.resolutionTime")}
        </div>
        <div className="oui-mt-2 oui-grid oui-grid-cols-[56px_1fr] oui-gap-y-2 oui-text-xs">
          <span className="oui-text-base-contrast-54">UTC+8</span>
          <span className="oui-text-end oui-text-base-contrast">
            {resolutionFormatter.format(new Date((itemRound + 300) * 1_000))}
          </span>
          <span className="oui-text-base-contrast-54">UTC</span>
          <span className="oui-text-end oui-text-base-contrast">
            {resolutionUtcFormatter.format(new Date((itemRound + 300) * 1_000))}
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
            {formatRoundLabel(itemRound, t("prediction.rounds.today"), round)}
          </button>
        </Tooltip>
      );
    });

  return (
    <div className="oui-absolute oui-inset-x-0 oui-bottom-0 oui-z-20 oui-flex oui-h-14 oui-items-center oui-gap-2 oui-border-t oui-border-line-6 oui-bg-base-9 oui-px-3">
      <div className="oui-relative oui-flex oui-min-w-0 oui-flex-1 oui-items-center oui-justify-start oui-gap-2 oui-overflow-x-auto">
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
                  {formatRoundTime(itemRound)}
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

const PriceChart: React.FC<{
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
  const [chartMode, setChartMode] = useState<PredictionChartMode>("price");
  const [liveCandles, setLiveCandles] = useState<PredictionCandle[]>(() =>
    createMockCandleHistory(currentPrice),
  );
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

  useEffect(() => {
    setFrozenChart(null);
    setHoveredPoint(null);
    setLiveCandles(createMockCandleHistory(currentPrice));
  }, [round]);

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  useEffect(() => {
    setLiveCandles((candles) => rollLiveCandles(candles, currentPrice));
  }, [currentPrice]);

  // Open the next minute's candle even when the price hasn't ticked.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveCandles((candles) =>
        rollLiveCandles(candles, currentPriceRef.current),
      );
    }, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const selectRound = onSelectRound;
  useEffect(() => {
    if (selectedRound < round) {
      const endTimestamp = (selectedRound + 300) * 1_000;
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
  const liveTimestamp = (round + 300 - countdown) * 1_000;
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
  const futureCountdown = countdown + Math.max(selectedRound - round - 300, 0);

  const chart = useMemo(() => {
    const isCandleMode = chartMode === "candles";
    const roundEnd = (selectedRound + 300) * 1_000;
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
          // Below xl only every other tick fits.
          compact: isCandleMode
            ? (candleAnchor - timestamp) % (tickInterval * 2) === 0
            : !isPastRound || timestamp % 600_000 === 0,
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
    <div className="oui-relative oui-h-[360px] oui-overflow-hidden oui-rounded-xl oui-bg-base-9 oui-p-4 xl:oui-h-[calc(100vh-330px)] xl:oui-min-h-[480px] xl:oui-max-h-[640px]">
      <style>{`
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
      <div className="oui-relative oui-z-10 oui-flex oui-items-center oui-gap-4 xl:oui-gap-8">
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
            {isFutureRound
              ? "--"
              : `$${usdFormatter.format(chartOpeningPrice)}`}
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
          <div className="oui-mt-1 oui-flex oui-items-center oui-gap-2 oui-whitespace-nowrap">
            <span
              className={cn(
                "oui-text-xl oui-font-semibold oui-tabular-nums",
                isPastRound ? "oui-text-base-contrast" : "oui-text-primary",
              )}
            >
              ${usdFormatter.format(chartCurrentPrice)}
            </span>
            {!isFutureRound && (
              <span
                className={cn(
                  "oui-text-xs oui-tabular-nums",
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
                $
                {usdFormatter.format(
                  Math.abs(chartCurrentPrice - chartOpeningPrice),
                )}
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
            onClick={() => selectRound(round)}
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
          "oui-absolute oui-inset-x-4 oui-top-20 oui-h-[calc(100%-168px)] oui-w-[calc(100%-2rem)]",
          isPastRound ? "oui-text-base-contrast-54" : "oui-text-primary",
        )}
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
        className="oui-absolute oui-start-4 oui-top-20 oui-z-20 oui-h-[calc(100%-168px)] oui-cursor-crosshair"
        style={{ width: `calc((100% - 32px) * ${plotWidth / width})` }}
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
                {formatChartHoverTime(hoveredPoint.timestamp)}
              </div>
              <div className="oui-mt-2 oui-whitespace-nowrap oui-text-base oui-font-semibold oui-tabular-nums oui-text-base-contrast">
                ${chartHoverPriceFormatter.format(hoveredPoint.price)}
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
            top: `calc(80px + (100% - 168px) * ${chart.endpointYRatio})`,
          }}
        />
      )}
      {chart.yTicks.map(({ ratio, value }) => (
        <span
          key={ratio}
          className="oui-pointer-events-none oui-absolute oui-end-4 oui-z-10 -oui-translate-y-1/2 oui-text-xs oui-tabular-nums oui-text-base-contrast-36"
          style={{
            top: `calc(80px + (100% - 168px) * ${ratio})`,
          }}
        >
          $
          {value.toLocaleString("en-US", {
            minimumFractionDigits: chart.yDecimals,
            maximumFractionDigits: chart.yDecimals,
          })}
        </span>
      ))}
      {!isFutureRound && (
        <div
          className="oui-pointer-events-none oui-absolute oui-end-3 oui-z-10 oui-flex -oui-translate-y-1/2 oui-items-center oui-rounded-e-md oui-bg-base-3 oui-px-3 oui-py-1 oui-text-xs oui-text-base-contrast"
          style={{
            top: `calc(80px + (100% - 168px) * ${chart.openingRatio})`,
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
        className="oui-pointer-events-none oui-absolute oui-bottom-14 oui-start-4 oui-z-10 oui-h-8 oui-text-xs oui-tabular-nums oui-text-base-contrast-36"
        style={{ width: `calc((100% - 32px) * ${plotWidth / width})` }}
      >
        {chart.xTicks.map(({ timestamp, ratio, compact }) => (
          <span
            key={timestamp}
            className={cn(
              "oui-absolute oui-top-2 -oui-translate-x-1/2 oui-whitespace-nowrap",
              !compact && "oui-hidden xl:oui-block",
            )}
            style={{ left: `${ratio * 100}%` }}
          >
            {(isPastRound || chartMode === "candles"
              ? roundTimeFormatter
              : chartTimeFormatter
            ).format(new Date(timestamp))}
          </span>
        ))}
      </div>
      <RoundNavigator
        round={round}
        countdown={countdown}
        roundPhase={roundPhase}
        selectedRound={selectedRound}
        onRoundChange={selectRound}
        chartMode={chartMode}
        onChartModeChange={(mode) => {
          setChartMode(mode);
          setHoveredPoint(null);
        }}
      />
    </div>
  );
};

const MobileMarketPanel: React.FC<PredictionState> = (state) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"chart" | "data">("chart");
  const [contentVisible, setContentVisible] = useState(true);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as "chart" | "data")}
      variant="contained"
      size="lg"
      contentVisible={contentVisible}
      className="oui-prediction-mobileMarket-tabs oui-overflow-hidden oui-rounded-xl oui-bg-base-9 xl:oui-hidden"
      classNames={{
        tabsList: "oui-p-2",
        tabsContent: "oui-min-h-[360px]",
      }}
      trailing={
        <button
          type="button"
          aria-expanded={contentVisible}
          className="oui-px-5 oui-text-base-contrast-54 hover:oui-text-base-contrast-80"
          onClick={() => setContentVisible((visible) => !visible)}
        >
          <ChevronUpIcon
            className={cn(
              "oui-transition-transform",
              !contentVisible && "oui-rotate-180",
            )}
            size={14}
            color="inherit"
          />
        </button>
      }
    >
      <TabPanel title={t("trading.tabs.chart")} value="chart">
        <PriceChart
          selectedRound={state.selectedRound}
          onSelectRound={state.selectMarketRound}
          points={state.priceHistory}
          openingPrice={state.openingPrice}
          currentPrice={state.currentPrice}
          round={state.round}
          countdown={state.countdown}
          roundPhase={state.roundPhase}
          onGoToLiveMarket={state.goToLiveRound}
        />
      </TabPanel>
      <TabPanel title={t("trading.tabs.data")} value="data">
        <div className="oui-h-[360px] oui-space-y-2 oui-rounded-b-xl oui-bg-base-9 oui-px-4 oui-pb-4">
          <div className="oui-flex oui-w-full oui-items-center oui-justify-between oui-text-xs">
            <Text intensity={36}>{t("prediction.chart.btcPrice")}</Text>
            <Text.numeral dp={2} intensity={80}>
              {state.currentPrice}
            </Text.numeral>
          </div>
          <div className="oui-flex oui-w-full oui-items-center oui-justify-between oui-text-xs">
            <Text intensity={36}>{t("prediction.chance")}</Text>
            <Text intensity={98}>{formatPercent(state.upChance)}</Text>
          </div>
        </div>
      </TabPanel>
    </Tabs>
  );
};

const PredictionOrderBook: React.FC<
  Pick<
    PredictionState,
    | "orderBook"
    | "selectedOutcome"
    | "selectedPrice"
    | "setLimitPrice"
    | "setOrderType"
    | "isRoundTradable"
    | "roundPhase"
  >
> = ({
  orderBook,
  selectedOutcome,
  selectedPrice,
  setLimitPrice,
  setOrderType,
  isRoundTradable,
  roundPhase,
}) => {
  const { t } = useTranslation();
  const selectPrice = (price: number) => {
    setOrderType("limit");
    setLimitPrice(price.toFixed(2));
  };

  const asks = useMemo(
    () =>
      orderBook.asks.map((level, index, levels) => {
        const accumulatedLevels = levels.slice(index);
        const accumulated = accumulatedLevels.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        const accumulatedAmount = accumulatedLevels.reduce(
          (total, item) => total + item.quantity * item.price,
          0,
        );
        return [level.price, level.quantity, accumulated, accumulatedAmount];
      }),
    [orderBook.asks],
  );

  const bids = useMemo(
    () =>
      orderBook.bids.map((level, index, levels) => {
        const accumulatedLevels = levels.slice(0, index + 1);
        const accumulated = accumulatedLevels.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        const accumulatedAmount = accumulatedLevels.reduce(
          (total, item) => total + item.quantity * item.price,
          0,
        );
        return [level.price, level.quantity, accumulated, accumulatedAmount];
      }),
    [orderBook.bids],
  );

  const isPastRound =
    roundPhase === "closed" ||
    roundPhase === "resolving" ||
    roundPhase === "resolvedUp" ||
    roundPhase === "resolvedDown" ||
    roundPhase === "void";
  const emptyLevels = useMemo(
    () =>
      Array.from({ length: 7 }, () => [
        Number.NaN,
        Number.NaN,
        Number.NaN,
        Number.NaN,
      ]),
    [],
  );
  const displayedAsks = isPastRound ? emptyLevels : asks;
  const displayedBids = isPastRound ? emptyLevels : bids;
  const displayedPrice = isPastRound ? Number.NaN : selectedPrice;

  return (
    <section
      className={cn(
        "oui-prediction-orderBook oui-flex oui-h-full oui-min-h-[300px] oui-flex-col oui-overflow-hidden oui-rounded-xl oui-bg-base-9 [&_.oui-orderBook-asks]:oui-h-full [&_.oui-orderBook-asks]:oui-justify-end [&_.oui-orderBook-markPrice]:oui-hidden xl:oui-min-h-[420px]",
        !isRoundTradable && "oui-pointer-events-none",
      )}
    >
      <div className="oui-flex oui-items-center oui-px-3 oui-pt-3">
        <span className="oui-text-sm oui-font-semibold oui-text-base-contrast">
          {t("prediction.orderBook")}
        </span>
      </div>
      <div className="oui-min-h-0 oui-flex-1 oui-pb-3">
        <PerpOrderBook
          level={7}
          asks={displayedAsks}
          bids={displayedBids}
          markPrice={displayedPrice}
          lastPrice={
            isPastRound
              ? [Number.NaN, Number.NaN]
              : [Math.max(selectedPrice - 0.01, 0), selectedPrice]
          }
          depths={["0.01"]}
          selDepth="0.01"
          symbol={`PREDICTION_BTC_${selectedOutcome.toUpperCase()}`}
          base={selectedOutcome.toUpperCase()}
          quote="USDC"
          isLoading={false}
          onItemClick={(item) => selectPrice(item[0])}
          cellHeight={20}
          onDepthChange={() => undefined}
          pendingOrders={[]}
          symbolInfo={{
            base_dp: 2,
            quote_dp: 2,
            base_tick: 0.01,
            base: selectedOutcome.toUpperCase(),
            quote: "USDC",
          }}
          isMobile={false}
          showBuySellRatio={false}
          setShowBuySellRatio={() => undefined}
          buySellRatio={null}
          showBuySellRatioSettings={false}
        />
      </div>
    </section>
  );
};

const RoundOrderStatusCard: React.FC<
  Pick<PredictionState, "round" | "roundPhase"> & { restricted?: boolean }
> = ({ round, roundPhase, restricted }) => {
  const { t } = useTranslation();
  const isResolving = roundPhase === "closed" || roundPhase === "resolving";
  const resolvedOutcome =
    roundPhase === "resolvedUp"
      ? "up"
      : roundPhase === "resolvedDown"
        ? "down"
        : null;

  return (
    <section
      className={cn(
        "oui-flex oui-h-full oui-min-h-[360px] oui-flex-col oui-items-center oui-justify-center oui-rounded-xl oui-bg-base-9 oui-p-6 oui-text-center md:oui-h-auto",
        restricted && "oui-flex-1 xl:oui-flex-none",
      )}
    >
      {restricted && (
        <div role="status">
          <h2 className="oui-text-lg oui-font-semibold oui-text-base-contrast">
            {t("prediction.region.restrictedTitle")}
          </h2>
          <p className="oui-mt-4 oui-max-w-72 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.region.restrictedDescription")}
          </p>
        </div>
      )}
      {!restricted && isResolving && (
        <>
          <Spinner size="lg" color="primary" />
          <h2 className="oui-mt-6 oui-text-lg oui-font-semibold oui-text-base-contrast">
            {t("prediction.resolution.determiningWinner")}
          </h2>
          <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.btcUpDown")} · {formatRoundWindow(round)}
          </p>
          <p className="oui-mt-5 oui-max-w-72 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.resolution.pendingDescription")}
          </p>
        </>
      )}

      {!restricted && resolvedOutcome && (
        <>
          <div
            className={cn(
              "oui-flex oui-size-16 oui-items-center oui-justify-center oui-rounded-full",
              resolvedOutcome === "up"
                ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                : "oui-bg-trade-loss/15 oui-text-trade-loss",
            )}
          >
            {resolvedOutcome === "up" ? (
              <CaretUpIcon size={32} color="inherit" opacity={1} />
            ) : (
              <CaretDownIcon size={32} color="inherit" opacity={1} />
            )}
          </div>
          <h2
            className={cn(
              "oui-mt-5 oui-text-lg oui-font-semibold",
              resolvedOutcome === "up"
                ? "oui-text-trade-profit"
                : "oui-text-trade-loss",
            )}
          >
            {t("prediction.resolution.outcome", {
              outcome: t(`prediction.${resolvedOutcome}`),
            })}
          </h2>
          <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.btcUpDown")} · {formatRoundWindow(round)}
          </p>
        </>
      )}

      {!restricted && roundPhase === "void" && (
        <>
          <div className="oui-flex oui-size-16 oui-items-center oui-justify-center oui-rounded-full oui-bg-base-6 oui-text-2xl oui-text-base-contrast-54">
            —
          </div>
          <h2 className="oui-mt-5 oui-text-lg oui-font-semibold oui-text-base-contrast">
            {t("prediction.resolution.voided")}
          </h2>
          <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.btcUpDown")} · {formatRoundWindow(round)}
          </p>
          <p className="oui-mt-5 oui-max-w-72 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.resolution.voidDescription")}
          </p>
        </>
      )}
    </section>
  );
};

const TradePanel: React.FC<
  PredictionState & {
    orderEntryAccountReady?: boolean;
    orderEntryFunded?: boolean;
  }
> = (state) => {
  const { t } = useTranslation();
  const orderEntryAccountReady = state.orderEntryAccountReady ?? true;
  const { isMobile } = useScreen();
  const orderEntryFunded = state.orderEntryFunded ?? true;
  const outcomeLabel = t(`prediction.${state.selectedOutcome}`);
  const inputUnit = state.amountUnit === "quote" ? "USDC" : outcomeLabel;
  const buttonLabel = `${t(`common.${state.orderSide}`)} ${t(`prediction.${state.selectedOutcome}`)}`;
  const availableValue = !orderEntryFunded
    ? `0 ${state.orderSide === "buy" ? "USDC" : outcomeLabel}`
    : state.orderSide === "buy"
      ? `${usdFormatter.format(state.balance)} USDC`
      : `${contractFormatter.format(state.availableQuantity(state.selectedOutcome))} ${outcomeLabel}`;
  const amountUnitOptions = [
    { label: "USDC", value: "quote" },
    { label: outcomeLabel, value: "outcome" },
  ];
  const maxDisplayValue = orderEntryFunded
    ? `${state.amountUnit === "quote" ? usdFormatter.format(state.maxAmount) : contractFormatter.format(state.maxAmount)} ${inputUnit}`
    : `0 ${inputUnit}`;
  const canAdjustAmount =
    orderEntryAccountReady &&
    orderEntryFunded &&
    state.maxAmount > 0 &&
    state.selectedPrice > 0 &&
    state.selectedPrice < 1 &&
    state.isRoundTradable &&
    !state.isRegionRestricted;
  const sliderColor = canAdjustAmount
    ? state.orderSide === "buy"
      ? "buy"
      : "sell"
    : undefined;

  return (
    <aside className="oui-overflow-hidden oui-rounded-xl oui-bg-base-9">
      <div className="oui-prediction-orderEntry-form oui-min-w-0 oui-p-3 oui-text-base-contrast-54">
        {isMobile ? (
          <Select.options
            size="md"
            value={state.orderType}
            options={(["limit", "market"] as const).map((type) => ({
              value: type,
              label: t(`common.${type}`),
            }))}
            disabled={!orderEntryAccountReady}
            onValueChange={(type) =>
              state.setOrderType(type as "limit" | "market")
            }
            classNames={{
              trigger:
                "oui-w-full oui-h-8 oui-rounded-md oui-border-line-12 oui-bg-base-8",
            }}
          />
        ) : (
          <div className="oui-flex oui-w-full oui-gap-1">
            {(["limit", "market"] as const).map((type) => (
              <button
                key={type}
                type="button"
                disabled={!orderEntryAccountReady}
                aria-pressed={state.orderType === type}
                onClick={() => state.setOrderType(type)}
                className={cn(
                  "oui-flex oui-h-8 oui-flex-1 oui-items-center oui-justify-center oui-gap-x-1 oui-rounded oui-px-3 oui-py-0.5 oui-text-xs oui-font-semibold disabled:oui-cursor-not-allowed",
                  state.orderType === type
                    ? "oui-bg-base-5 oui-text-base-contrast"
                    : "oui-bg-base-7 oui-text-base-contrast-36",
                )}
              >
                <Text size="xs">{t(`common.${type}`)}</Text>
              </button>
            ))}
          </div>
        )}

        <div className="oui-mt-2 oui-grid oui-w-full oui-flex-1 oui-grid-cols-2 oui-gap-x-2 xl:oui-mt-3 xl:oui-flex xl:oui-gap-x-[6px]">
          {(["buy", "sell"] as const).map((side) => (
            <Button
              key={side}
              type="button"
              size="md"
              fullWidth
              aria-pressed={state.orderSide === side}
              onClick={() => state.setOrderSide(side)}
              className={cn(
                side === "buy"
                  ? state.orderSide === side && orderEntryAccountReady
                    ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
                    : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6"
                  : state.orderSide === side && orderEntryAccountReady
                    ? "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80"
                    : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
              )}
            >
              {t(`common.${side}`)}
            </Button>
          ))}
        </div>

        <div className="oui-mt-2 oui-grid oui-grid-cols-2 oui-overflow-hidden oui-rounded-lg oui-bg-base-10 oui-p-0.5 xl:oui-mt-3">
          {(["up", "down"] as const).map((outcome) => {
            const isActive = state.selectedOutcome === outcome;
            return (
              <button
                key={outcome}
                type="button"
                onClick={() => state.setSelectedOutcome(outcome)}
                className={cn(
                  "oui-flex oui-h-12 oui-flex-col oui-items-center oui-justify-center oui-rounded-md oui-text-xs oui-font-semibold oui-leading-tight oui-transition-colors",
                  outcome === "up"
                    ? isActive
                      ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                      : "oui-text-base-contrast-54 hover:oui-bg-trade-profit/10"
                    : isActive
                      ? "oui-bg-trade-loss/15 oui-text-trade-loss"
                      : "oui-text-base-contrast-54 hover:oui-bg-trade-loss/10",
                )}
              >
                <span>{t(`prediction.${outcome}`)}</span>
                <span className="oui-mt-0.5 oui-tabular-nums">
                  ${formatContractPrice(state.outcomePrices[outcome])}
                </span>
              </button>
            );
          })}
        </div>

        <div className="oui-mt-2 oui-flex oui-items-center oui-justify-between oui-text-2xs xl:oui-mt-3">
          <Tips
            title={t("common.tips")}
            content={
              <div className="oui-text-pretty oui-text-2xs oui-leading-normal oui-text-base-contrast-80">
                {t(
                  state.orderSide === "buy"
                    ? "prediction.available.buyHint"
                    : "prediction.available.sellHint",
                )}
              </div>
            }
            trigger={
              <Text
                size="2xs"
                className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12 oui-text-base-contrast-54"
              >
                {t("common.available")}
              </Text>
            }
          />
          <div className="oui-flex oui-items-center oui-gap-1">
            <span className="oui-text-base-contrast-80">{availableValue}</span>
            {state.orderSide === "buy" && (
              <Button
                type="button"
                variant="text"
                size="xs"
                color="secondary"
                aria-label={t("common.deposit")}
                className="oui-p-0 hover:oui-text-base-contrast-80"
                disabled={state.isRegionRestricted}
                onClick={() =>
                  modal.show(
                    isMobile
                      ? "DepositAndWithdrawWithSheetId"
                      : "DepositAndWithdrawWithDialogId",
                    { activeTab: "deposit" },
                  )
                }
              >
                <AddCircleIcon opacity={1} />
              </Button>
            )}
          </div>
        </div>

        <div className="oui-mt-2 oui-space-y-1 xl:oui-mt-3">
          {state.orderType === "limit" && (
            <>
              <PredictionOrderInput
                id="prediction-limit-price"
                label={t("common.price")}
                value={state.limitPrice}
                suffix="USDC"
                onChange={state.setLimitPrice}
                position="top"
              />
              <PredictionOrderInput
                id="prediction-order-amount"
                label={t("common.amount")}
                value={state.amount}
                suffix={outcomeLabel}
                onChange={state.setAmount}
                position="middle"
              />
              <PredictionOrderInput
                id="prediction-total-value"
                label={t("common.totalValue")}
                value={
                  state.orderQuantity > 0
                    ? usdFormatter.format(state.orderNotional)
                    : ""
                }
                suffix="USDC"
                readOnly
                position="bottom"
              />
            </>
          )}

          {state.orderType === "market" && (
            <PredictionOrderInput
              id="prediction-order-amount"
              label={t("common.amount")}
              value={state.amount}
              suffix={
                <Select.options
                  size="xs"
                  showCaret
                  value={state.amountUnit}
                  options={amountUnitOptions}
                  valueFormatter={(value) =>
                    amountUnitOptions.find((option) => option.value === value)
                      ?.label
                  }
                  classNames={{
                    trigger:
                      "oui-w-auto oui-border-none oui-bg-transparent oui-p-0 oui-shadow-none oui-text-base-contrast",
                  }}
                  contentProps={{ className: "oui-min-w-[112px]" }}
                  onValueChange={state.setAmountUnit}
                />
              }
              onChange={state.setAmount}
              dp={state.amountUnit === "quote" ? 2 : 4}
              position="single"
            />
          )}
        </div>

        <div className="oui-mt-2 xl:oui-mt-3">
          <Slider
            value={[canAdjustAmount ? state.orderPercentage : 0]}
            min={0}
            max={100}
            step={1}
            markCount={4}
            showTip
            color={sliderColor}
            disabled={!canAdjustAmount}
            tipFormatter={(value) => `${Math.round(value)}%`}
            onValueChange={(value) => state.setOrderPercentage(value[0])}
          />
          <div className="oui-flex oui-items-center oui-justify-between oui-pt-1 xl:oui-pt-2">
            <Text.numeral
              size="2xs"
              color={sliderColor}
              dp={2}
              padding={false}
              suffix="%"
            >
              {canAdjustAmount ? state.orderPercentage : 0}
            </Text.numeral>
            <button
              type="button"
              disabled={!canAdjustAmount}
              onClick={() => state.setOrderPercentage(100)}
              className="oui-flex oui-items-center oui-gap-1 oui-text-2xs oui-text-base-contrast-54 disabled:oui-cursor-not-allowed"
            >
              {t(
                state.orderSide === "buy"
                  ? "orderEntry.maxBuy"
                  : "orderEntry.maxSell",
              )}
              <Text size="2xs" color={sliderColor}>
                {maxDisplayValue}
              </Text>
            </button>
          </div>
        </div>

        <div className="oui-mt-4 oui-space-y-2 oui-text-xs">
          <InfoRow
            label={t("prediction.odds")}
            hint={t("prediction.oddsHint")}
            value={`${state.odds.toFixed(2)}x`}
            dashed
          />
          <InfoRow
            label={t("prediction.toWin")}
            hint={t("prediction.toWinHint")}
            value={
              state.orderQuantity > 0
                ? `${usdFormatter.format(state.estimatedPayout)} USDC`
                : "-- USDC"
            }
            dashed
          />
        </div>

        <Button
          className={cn(
            "oui-mt-4",
            !orderEntryFunded
              ? "oui-bg-base-5 oui-text-base-contrast-36"
              : state.orderSide === "buy"
                ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
                : "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80",
          )}
          fullWidth
          size="md"
          disabled={!orderEntryFunded || !state.canPlaceOrder}
          onClick={state.placeOrder}
        >
          {buttonLabel}
        </Button>

        <div className="oui-mt-2 oui-text-center oui-text-2xs oui-font-normal oui-text-base-contrast-54">
          {t("prediction.tradingAgreement")}{" "}
          <span className="oui-border-b oui-border-line-36 oui-text-base-contrast-54">
            {t("prediction.termOfUse")}
          </span>
        </div>

        <div className="oui-mt-4 oui-space-y-2 oui-text-xs">
          {state.orderType === "market" && (
            <SlippageUI
              slippage={state.slippage}
              setSlippage={state.setSlippage}
              estSlippage={state.estimatedSlippage}
            />
          )}
          <InfoRow
            label={t("common.fees")}
            value={`${t("dmm.taker")}: --% / ${t("dmm.maker")}: 0%`}
          />
        </div>
      </div>
    </aside>
  );
};

const PredictionOrderInput: React.FC<{
  id: string;
  label: string;
  value: string;
  suffix: React.ReactNode;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  dp?: number;
  position: "top" | "middle" | "bottom" | "single";
}> = ({ id, label, value, suffix, onChange, readOnly, dp = 4, position }) => (
  <Input
    id={id}
    name={id}
    fullWidth
    size="lg"
    autoComplete="off"
    inputMode="decimal"
    placeholder="0"
    value={value}
    readOnly={readOnly}
    formatters={[
      inputFormatter.dpFormatter(dp),
      inputFormatter.numberFormatter,
      inputFormatter.currencyFormatter,
      inputFormatter.decimalPointFormatter,
    ]}
    prefix={
      <label
        htmlFor={id}
        className="oui-absolute oui-start-2 oui-top-[7px] oui-text-2xs oui-text-base-contrast-36"
      >
        {label}
      </label>
    }
    suffix={
      typeof suffix === "string" ? (
        suffix
      ) : (
        <div className="oui-absolute oui-end-0 oui-top-0 oui-flex oui-h-full oui-flex-col oui-items-end oui-justify-end oui-px-2 oui-py-2 oui-text-2xs oui-text-base-contrast-36">
          {suffix}
        </div>
      )
    }
    classNames={{
      root: cn(
        "oui-relative oui-h-[54px] oui-border oui-border-solid oui-border-line oui-px-2 oui-py-1 focus-within:oui-border-transparent",
        position === "single" && "oui-rounded-xl",
        position === "top" && "oui-rounded-t-xl oui-rounded-b",
        position === "middle" && "oui-rounded",
        position === "bottom" && "oui-rounded-t oui-rounded-b-xl",
      ),
      input: "oui-mb-1 oui-mt-5 oui-h-5",
      suffix:
        "oui-absolute oui-end-0 oui-top-0 oui-items-end oui-justify-end oui-py-2 oui-text-2xs oui-text-base-contrast-36",
    }}
    onValueChange={onChange}
  />
);

const InfoRow: React.FC<{
  label: string;
  value: string;
  hint?: React.ReactNode;
  valueClassName?: string;
  dashed?: boolean;
}> = ({ label, value, hint, valueClassName, dashed }) => (
  <div className="oui-flex oui-items-center oui-justify-between oui-gap-4">
    <Tooltip
      open={hint ? undefined : false}
      content={hint}
      className="oui-max-w-[330px] oui-bg-base-6"
      arrow={{ className: "oui-fill-base-6" }}
      delayDuration={300}
    >
      <span
        className={cn(
          "oui-text-base-contrast-54",
          hint && "oui-cursor-pointer",
          dashed &&
            "oui-border-b oui-border-dashed oui-border-line-12 oui-leading-4",
        )}
      >
        {label}
      </span>
    </Tooltip>
    <span
      className={cn(
        "oui-text-end oui-font-medium oui-text-base-contrast",
        valueClassName,
      )}
    >
      {value}
    </span>
  </div>
);

const PredictionPrototypeAuthContext =
  React.createContext<PredictionPrototypeAuthState>("real");

const PrototypeAuthPrompt: React.FC<{
  state: Exclude<PredictionPrototypeAuthState, "real" | "funded">;
  disabled?: boolean;
}> = ({ state, disabled = false }) => {
  const { t } = useTranslation();
  const content = {
    disconnected: {
      label: t("connector.connectWallet"),
      description: t("connector.trade.connectWallet.tooltip"),
    },
    connected: {
      label: t("connector.createAccount"),
      description: t("connector.trade.createAccount.tooltip"),
    },
    accountReady: {
      label: t("common.deposit"),
      description: t("trading.asset.startTrading.description"),
    },
  }[state];

  return (
    <div className="oui-flex oui-h-full oui-min-h-36 oui-flex-col oui-items-center oui-justify-center oui-p-6 oui-text-center">
      <Button
        size="md"
        color="primary"
        variant={disabled ? undefined : "gradient"}
        disabled={disabled}
      >
        {content.label}
      </Button>
      <Text size="2xs" intensity={36} className="oui-mt-4 oui-max-w-sm">
        {content.description}
      </Text>
    </div>
  );
};

export type PredictionDataPanelProps = {
  state: PredictionState;
  tabs?: PredictionDataTab[];
  className?: string;
  embedded?: boolean;
};

export const PredictionDataPanel: React.FC<PredictionDataPanelProps> = ({
  state,
  tabs = [
    "predictions",
    "openOrders",
    "filled",
    "predictionHistory",
    "orderHistory",
    "assets",
  ],
  className,
  embedded = false,
}) => {
  const { t } = useTranslation();
  const [positionProduct, setPositionProduct] =
    useState<ProductType>("prediction");
  const showPrototypeData =
    state.prototypeAuthState === "real" ||
    state.prototypeAuthState === "funded";

  const tabCount: Partial<Record<PredictionDataTab, number>> = {
    openOrders: showPrototypeData ? state.openOrders.length : 0,
    predictions: showPrototypeData ? state.positions.length : 0,
  };

  const tabContent: Record<PredictionDataTab, React.ReactNode> = {
    openOrders: <SharedProductOrdersPanel state={state} mode="pending" />,
    predictions: (
      <SharedProductDataPanel
        state={state}
        type="positions"
        initialProduct="prediction"
        onProductChange={setPositionProduct}
      />
    ),
    filled: <SharedProductOrdersPanel state={state} mode="filled" />,
    predictionHistory: (
      <SharedProductDataPanel
        state={state}
        type="positionHistory"
        initialProduct="prediction"
      />
    ),
    assets: <AssetsTable state={state} />,
    orderHistory: <SharedProductOrdersPanel state={state} mode="history" />,
  };

  return (
    <PredictionPrototypeAuthContext.Provider value={state.prototypeAuthState}>
      <Box
        intensity={900}
        r={embedded ? undefined : "2xl"}
        p={embedded ? 0 : 2}
        className={cn(
          "oui-prediction-dataPanel-container oui-h-full oui-overflow-hidden",
          "oui-relative",
          className,
        )}
      >
        <Tabs
          className="oui-prediction-dataPanel-tabs oui-h-full"
          value={state.activeTab}
          onValueChange={(value) =>
            state.setActiveTab(value as PredictionDataTab)
          }
          variant={embedded ? undefined : "contained"}
          size={embedded ? undefined : "lg"}
          classNames={{
            tabsList: embedded ? "!oui-border-none oui-pb-1" : undefined,
            trigger: "oui-group oui-dataPanel-tab-btn",
            tabsContent: embedded
              ? "oui-h-[calc(100%_-_28px)] oui-min-h-36 oui-overflow-x-auto"
              : "oui-h-[calc(100%_-_32px)] oui-min-h-36 oui-overflow-x-auto",
          }}
        >
          {tabs.map((tab) => (
            <TabPanel
              key={tab}
              value={tab}
              title={
                <>
                  {t(`prediction.tab.${tab}`)}
                  {(tabCount[tab] ?? 0) > 0 && ` (${tabCount[tab]})`}
                </>
              }
            >
              {tabContent[tab]}
            </TabPanel>
          ))}
        </Tabs>
        {state.activeTab === "predictions" && positionProduct === "perps" && (
          <div className="oui-absolute oui-end-2 oui-top-2 oui-z-10">
            <PerpsPositionsSettings />
          </div>
        )}
      </Box>
    </PredictionPrototypeAuthContext.Provider>
  );
};

type ProductDataType = "positions" | "positionHistory";
type ProductType = "perps" | "prediction";

export type SharedProductDataPanelProps = {
  state: PredictionState;
  type: ProductDataType;
  /** The product shown when this panel first opens on a page. */
  initialProduct: ProductType;
  perpsSymbol?: string;
  /** Content rendered before the Perps / Prediction control, such as account filters. */
  beforeProductSelector?: React.ReactNode;
  perpsPositionsContent?: React.ReactNode;
  perpsPositionHistoryContent?: React.ReactNode;
  onProductChange?: (product: ProductType) => void;
};

/**
 * Lets either trading surface inspect Perps and Prediction data without
 * combining their different columns or filters into one table.
 */
export const SharedProductDataPanel: React.FC<SharedProductDataPanelProps> = ({
  state,
  type,
  initialProduct,
  perpsSymbol,
  beforeProductSelector,
  perpsPositionsContent,
  perpsPositionHistoryContent,
  onProductChange,
}) => {
  const { t } = useTranslation();
  const [product, setProduct] = useState<ProductType>(initialProduct);
  const [perpsPositions] = usePositionStream();
  const perpsPositionCount = useDataTap(perpsPositions.rows?.length) ?? 0;
  const predictionPositionCount = state.positions.length;

  const content =
    product === "prediction" ? (
      type === "positions" ? (
        <HoldingsTable state={state} />
      ) : (
        <PredictionHistoryTable state={state} />
      )
    ) : type === "positions" ? (
      (perpsPositionsContent ?? <PerpsPositionsPanel symbol={perpsSymbol} />)
    ) : (
      (perpsPositionHistoryContent ?? <PositionHistoryWidget />)
    );

  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col">
      {beforeProductSelector}
      <div
        role="tablist"
        aria-label={t("common.positions")}
        className="oui-mt-2 oui-inline-flex oui-w-fit oui-gap-x-[6px]"
      >
        {(["perps", "prediction"] as const).map((item) => {
          const active = product === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setProduct(item);
                onProductChange?.(item);
              }}
              data-state={active ? "active" : "inactive"}
              className={cn(
                "oui-group !oui-rounded-md oui-inline-flex oui-h-7 oui-items-center oui-justify-center oui-gap-x-1 oui-bg-base-7 oui-px-3 oui-text-2xs oui-font-medium oui-text-base-contrast-36 oui-transition-all hover:oui-bg-base-5 hover:oui-text-base-contrast-54 data-[state=active]:oui-bg-base-5 data-[state=active]:oui-text-base-contrast",
              )}
            >
              {item === "perps" ? t("common.perps") : t("prediction.title")} (
              {item === "perps" ? perpsPositionCount : predictionPositionCount})
            </button>
          );
        })}
      </div>
      <div className="oui-min-h-0 oui-flex-1 oui-overflow-hidden">
        {content}
      </div>
    </div>
  );
};

type PredictionTableRow = {
  id: string;
  cells: React.ReactNode[];
  sortValues?: Array<string | number | undefined>;
  [key: string]: React.ReactNode | React.ReactNode[];
};

type PredictionTableColumn = {
  title: React.ReactNode;
  width: number;
  align?: "left" | "center" | "right";
  fixed?: "start" | "end";
  sortable?: boolean;
  type?: "data" | "action";
};

const tableColumn = (
  title: React.ReactNode,
  width: number,
  options?: Omit<PredictionTableColumn, "title" | "width">,
): PredictionTableColumn => ({ title, width, ...options });

const PredictionDataTable: React.FC<{
  columns: PredictionTableColumn[];
  rows: PredictionTableRow[];
  minWidth?: number;
  toolbar?: React.ReactNode;
}> = ({ columns, rows, minWidth = 720, toolbar }) => {
  const prototypeAuthState = React.useContext(PredictionPrototypeAuthContext);
  const dataColumns = useMemo<Column<PredictionTableRow>[]>(
    () =>
      columns.map((column, index) => ({
        title: column.title,
        plantTextTitle:
          typeof column.title === "string" ? column.title : undefined,
        dataIndex: `cell_${index}`,
        width: column.width,
        align: column.align ?? "left",
        fixed: column.fixed,
        type: column.type,
        onSort: column.sortable,
        render: (_value, record) => record.cells[index],
        renderPlantText: (_value, record) =>
          String(record.sortValues?.[index] ?? ""),
      })),
    [columns],
  );

  const dataSource = useMemo(
    () =>
      rows.map((row) =>
        row.cells.reduce<PredictionTableRow>(
          (record, cell, index) => {
            record[`cell_${index}`] = row.sortValues?.[index] ?? cell;
            return record;
          },
          { ...row },
        ),
      ),
    [rows],
  );

  return (
    <div
      className="oui-prediction-dataTable-container oui-h-full"
      style={{ minWidth }}
    >
      {toolbar}
      {prototypeAuthState === "real" ? (
        <AuthGuardDataTable
          className="oui-prediction-dataTable"
          columns={dataColumns}
          dataSource={dataSource}
          bordered
          ignoreLoadingCheck
          classNames={{
            header: "oui-h-[38px]",
            root: cn(
              "oui-items-start",
              toolbar && "!oui-h-[calc(100%_-_49px)]",
            ),
          }}
          onRow={() => ({
            className: "oui-h-12 oui-text-base-contrast-80",
          })}
          generatedRowKey={(record) => record.id}
          pagination={
            dataSource.length > 8
              ? {
                  page: 1,
                  pageSize: 8,
                  count: dataSource.length,
                }
              : undefined
          }
          features={[TableFeatures.DownloadFeature]}
        />
      ) : (
        <DataTable
          className="oui-prediction-dataTable"
          columns={dataColumns}
          dataSource={prototypeAuthState === "funded" ? dataSource : []}
          bordered
          ignoreLoadingCheck
          emptyView={
            prototypeAuthState === "funded" ? undefined : (
              <PrototypeAuthPrompt state={prototypeAuthState} />
            )
          }
          classNames={{
            header: "oui-h-[38px]",
            root: cn(
              "oui-items-start",
              toolbar && "!oui-h-[calc(100%_-_49px)]",
            ),
          }}
          onRow={() => ({
            className: "oui-h-12 oui-text-base-contrast-80",
          })}
          generatedRowKey={(record) => record.id}
          pagination={
            dataSource.length > 8
              ? {
                  page: 1,
                  pageSize: 8,
                  count: dataSource.length,
                }
              : undefined
          }
          features={[TableFeatures.DownloadFeature]}
        />
      )}
    </div>
  );
};

/* eslint-disable react/jsx-key -- DataTable cells are positional arrays keyed by their parent row. */
const RoundSymbol = ({
  round,
  outcome,
}: {
  round: number;
  outcome: PredictionOutcome;
}) => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-items-center oui-gap-2 oui-py-1 oui-whitespace-nowrap">
      <span
        aria-hidden="true"
        className={cn(
          "oui-h-[42px] oui-w-1 oui-shrink-0 oui-rounded-[1px]",
          outcome === "up" ? "oui-bg-trade-profit" : "oui-bg-trade-loss",
        )}
      />
      <div>
        <div>{t("prediction.btcUpDown")}</div>
        <div className="oui-mt-1 oui-text-base-contrast-54 oui-tabular-nums">
          {formatRoundBadge(round)}
        </div>
      </div>
    </div>
  );
};

const PredictionOrderSymbol = ({
  order,
}: {
  order: PredictionState["openOrders"][number];
}) => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-items-center oui-gap-2 oui-py-1">
      <span
        aria-label={t(`common.${order.side}`)}
        title={t(`common.${order.side}`)}
        className={cn(
          "oui-h-[34px] oui-w-1 oui-shrink-0 oui-rounded-[1px]",
          order.side === "buy" ? "oui-bg-trade-profit" : "oui-bg-trade-loss",
        )}
      />
      <div className="oui-min-w-0 oui-text-base-contrast">
        <div className="oui-whitespace-nowrap">{t("prediction.btcUpDown")}</div>
        <div className="oui-mt-1 oui-flex oui-items-center oui-gap-1 oui-whitespace-nowrap">
          <Badge color="neutral" size="xs">
            {t(`common.${order.type}`)}
          </Badge>
          <span className="oui-whitespace-nowrap oui-text-base-contrast-54 oui-tabular-nums">
            {formatRoundBadge(order.round)}
          </span>
        </div>
      </div>
    </div>
  );
};

const SellPosition = ({
  state,
  outcome,
}: {
  state: PredictionState;
  outcome: PredictionOutcome;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"market" | "limit">("market");
  const available = state.availableQuantity(outcome);
  const estimatedSlippage = useMemo(
    () => state.estimateOrderSlippage("sell", Number(quantity), outcome),
    [outcome, quantity, state],
  );
  const isSlippageExceeded =
    type === "market" &&
    estimatedSlippage !== null &&
    estimatedSlippage > new Decimal(state.slippage || 0).div(100).toNumber();
  const percentage =
    available > 0
      ? Math.max(
          0,
          Math.min(
            100,
            new Decimal(Number(quantity) || 0)
              .div(available)
              .mul(100)
              .toNumber(),
          ),
        )
      : 0;
  const selectPercentage = (value: number) =>
    setQuantity(
      value === 100
        ? String(available)
        : new Decimal(available)
            .mul(value)
            .div(100)
            .toFixed(4, Decimal.ROUND_DOWN),
    );
  const tradable = state.isRoundTradable && !state.isRegionRestricted;
  const valid =
    tradable &&
    Number(quantity) > 0 &&
    Number(quantity) <= available &&
    !isSlippageExceeded &&
    (type === "market" || (Number(price) > 0 && Number(price) < 1));
  return (
    <PopoverRoot
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
          setQuantity(String(available));
          setPrice(state.outcomePrices[outcome].toFixed(4));
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={!tradable || available <= 0}
        >
          {t("common.sell")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="oui-w-[360px] oui-max-w-[calc(100vw-32px)] oui-p-5"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="oui-flex oui-flex-col oui-gap-2">
          <div>
            <OutcomeBadge outcome={outcome} />
          </div>
          <div className="oui-mb-1 oui-flex oui-w-full oui-items-center oui-gap-2">
            <Input.tooltip
              prefix={t("common.quantity")}
              align="right"
              size="md"
              fullWidth
              autoComplete="off"
              formatters={[
                inputFormatter.numberFormatter,
                inputFormatter.dpFormatter(4),
              ]}
              triggerClassName="oui-min-w-0 oui-flex-1"
              classNames={{
                prefix: "oui-text-base-contrast-54",
                root: "oui-w-full oui-outline-line-12",
              }}
              value={quantity}
              onValueChange={setQuantity}
            />
          </div>
          <div className="oui-flex oui-w-full oui-gap-2">
            {[25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                variant="outlined"
                size="xs"
                color="secondary"
                className={cn(
                  "oui-w-1/4",
                  percentage === value && "oui-border-primary oui-text-primary",
                )}
                onClick={() => selectPercentage(value)}
              >
                {value}%
              </Button>
            ))}
          </div>
          <Slider
            showTip
            markCount={4}
            min={0}
            max={100}
            color="primary"
            value={[percentage]}
            onValueChange={([value]) => selectPercentage(value)}
          />
          <div className="oui-flex oui-w-full oui-items-center oui-justify-between">
            <Text size="2xs" color="primary">
              {new Decimal(percentage).toDecimalPlaces(2).toNumber()}%
            </Text>
            <div className="oui-flex oui-items-center oui-gap-1">
              <Text size="2xs" intensity={54}>
                {t("common.available")}
              </Text>
              <Text.numeral intensity={54} size="2xs" dp={4} padding={false}>
                {available}
              </Text.numeral>
            </div>
          </div>
          <Divider my={2} intensity={8} className="oui-w-full" />
          <Input.tooltip
            size="md"
            fullWidth
            autoComplete="off"
            triggerClassName="oui-w-full"
            formatters={[
              inputFormatter.numberFormatter,
              inputFormatter.dpFormatter(4),
            ]}
            value={type === "market" ? "" : price}
            onValueChange={setPrice}
            disabled={type === "market"}
            placeholder={type === "market" ? "--" : ""}
            classNames={{
              suffix: "oui-text-base-contrast-54",
              root: "oui-w-full oui-outline-line-12 focus-within:oui-outline-line-12",
            }}
            suffix={
              <Select.options
                variant="text"
                size="md"
                classNames={{
                  trigger: "oui-w-[--radix-select-content-available-width]",
                }}
                contentProps={{
                  align: "end",
                  className: "oui-border oui-border-line-6",
                }}
                value={type}
                options={[
                  { label: t("common.limit"), value: "limit" },
                  { label: t("common.market"), value: "market" },
                ]}
                onValueChange={(value) => setType(value as "market" | "limit")}
              />
            }
          />
          {type === "market" && (
            <div className="oui-mt-2">
              <SlippageUI
                slippage={state.slippage}
                setSlippage={state.setSlippage}
                estSlippage={estimatedSlippage}
              />
            </div>
          )}
          <div className="oui-mt-3 oui-flex oui-w-full oui-gap-2 oui-pb-1">
            <Button
              size="md"
              fullWidth
              color="secondary"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="md"
              fullWidth
              disabled={!valid}
              onClick={() => {
                if (
                  state.sellPosition(
                    outcome,
                    Number(quantity),
                    type,
                    Number(price),
                  )
                )
                  setOpen(false);
              }}
            >
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};

const PredictionFilters = ({
  filters,
  mode,
  trailing,
  leadingItems = [],
  onLeadingFilter,
}: {
  filters: ReturnType<typeof usePredictionFilters>;
  mode: "holdings" | "pending" | "filled" | "history" | "settlements";
  trailing?: React.ReactNode;
  leadingItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
}) => {
  const { t } = useTranslation();
  const items: DataFilterItem[] = [];
  if (mode !== "holdings" && mode !== "settlements")
    items.push({
      type: "select",
      name: "side",
      value: filters.side,
      options: [
        { label: t("common.side.all"), value: "all" },
        { label: t("common.buy"), value: "buy" },
        { label: t("common.sell"), value: "sell" },
      ],
    });
  items.push({
    type: "select",
    name: "outcome",
    value: filters.outcome,
    options: [
      { label: t("prediction.filter.allOutcomes"), value: "all" },
      { label: t("prediction.up"), value: "up" },
      { label: t("prediction.down"), value: "down" },
    ],
  });
  if (mode === "history") {
    items.push({
      type: "select",
      name: "status",
      value: filters.status,
      options: [
        { label: t("common.status.all"), value: "all" },
        { label: t("orders.status.pending"), value: "pending" },
        { label: t("prediction.status.filled"), value: "filled" },
        { label: t("prediction.status.cancelled"), value: "cancelled" },
      ],
    });
  }
  if (mode === "history" || mode === "settlements") {
    items.push({
      type: "range",
      name: "dateRange",
      value: { from: filters.dateRange.from, to: filters.dateRange.to },
      fromDate: predictionDateRange(90).from,
      toDate: predictionDateRange(1).to,
    });
  }
  return (
    <div className="oui-flex oui-flex-wrap oui-items-center oui-gap-3 oui-px-2">
      <DataFilter
        className="oui-w-auto oui-flex-wrap oui-gap-y-3"
        items={[...leadingItems, ...items]}
        onFilter={(filter) => {
          if (leadingItems.some((item) => item.name === filter.name)) {
            onLeadingFilter?.(filter);
            return;
          }
          filters.onFilter(filter);
        }}
      />
      {mode === "settlements" &&
        [1, 7, 30, 90].map((days) => (
          <button
            key={days}
            type="button"
            aria-pressed={filters.days === days}
            onClick={() => filters.updateDays(days)}
            className="oui-relative oui-rounded oui-px-2 oui-py-[2px] oui-text-sm"
          >
            <span className="oui-pointer-events-none oui-absolute oui-inset-0 oui-rounded oui-opacity-[.12] oui-gradient-primary" />
            <Text.gradient
              color={filters.days === days ? "brand" : undefined}
              className={
                filters.days !== days ? "oui-text-base-contrast-54" : undefined
              }
            >
              {days}D
            </Text.gradient>
          </button>
        ))}
      {trailing && <div className="oui-ml-auto">{trailing}</div>}
    </div>
  );
};

const HoldingsTable = ({
  state,
  leadingFilterItems,
  onLeadingFilter,
}: {
  state: PredictionState;
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
}) => {
  const { t } = useTranslation();
  const filters = usePredictionFilters();
  return (
    <PredictionDataTable
      minWidth={1320}
      toolbar={
        <PredictionFilters
          filters={filters}
          mode="holdings"
          leadingItems={leadingFilterItems}
          onLeadingFilter={onLeadingFilter}
        />
      }
      columns={[
        tableColumn(t("common.symbol"), 250, { fixed: "start" }),
        tableColumn(t("prediction.outcome"), 100),
        tableColumn(t("prediction.size"), 110, { sortable: true }),
        tableColumn(t("common.available"), 110, { sortable: true }),
        tableColumn(t("prediction.entryPrice"), 130, { sortable: true }),
        tableColumn(t("prediction.lastPrice"), 130, { sortable: true }),
        tableColumn(t("common.unrealizedPnl"), 170, { sortable: true }),
        tableColumn(t("prediction.countdownStatus"), 150),
        tableColumn("", 100, { fixed: "end", align: "right", type: "action" }),
      ]}
      rows={state.positions.filter(filters.matches).map((position) => ({
        id: position.outcome,
        sortValues: [
          undefined,
          undefined,
          position.quantity,
          state.availableQuantity(position.outcome),
          position.averagePrice,
          state.outcomePrices[position.outcome],
          new Decimal(state.outcomePrices[position.outcome])
            .sub(position.averagePrice)
            .mul(position.quantity)
            .toNumber(),
        ],
        cells: [
          <RoundSymbol round={state.round} outcome={position.outcome} />,
          <OutcomeBadge outcome={position.outcome} />,
          <TableNumber value={position.quantity} />,
          <TableNumber value={state.availableQuantity(position.outcome)} />,
          <TableNumber value={position.averagePrice} />,
          <TableNumber value={state.outcomePrices[position.outcome]} />,
          <Text.pnl dp={2} coloring>
            {new Decimal(state.outcomePrices[position.outcome])
              .sub(position.averagePrice)
              .mul(position.quantity)
              .toNumber()}
          </Text.pnl>,
          state.isRoundTradable
            ? formatCountdown(state.countdown)
            : t(`prediction.playground.phase.${state.roundPhase}`),
          <SellPosition state={state} outcome={position.outcome} />,
        ],
      }))}
    />
  );
};

const PendingValue = ({
  state,
  order,
  field,
}: {
  state: PredictionState;
  order: PredictionState["openOrders"][number];
  field: "price" | "quantity";
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(order[field]));
  const [error, setError] = useState(false);
  return (
    <PopoverRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setValue(String(order[field]));
        setError(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="text"
          color="secondary"
          size="xs"
          disabled={!state.isRoundTradable || state.isRegionRestricted}
        >
          {field === "quantity" ? "0 / " : ""}
          <TableNumber value={order[field]} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="oui-w-64 oui-p-4">
        <Input value={value} onValueChange={setValue} />
        {error && <Text color="danger">{t("prediction.invalidOrder")}</Text>}
        <div className="oui-mt-3 oui-flex oui-justify-end oui-gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="secondary"
            onClick={() => setOpen(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (
                state.editPendingOrder(
                  order.id,
                  field === "price" ? Number(value) : order.price,
                  field === "quantity" ? Number(value) : order.quantity,
                )
              )
                setOpen(false);
              else setError(true);
            }}
          >
            {t("common.confirm")}
          </Button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};

export const PredictionOrderCell = ({
  state,
  order,
  field,
}: {
  state: PredictionState;
  order: PredictionState["openOrders"][number] & {
    status?: "filled" | "cancelled";
  };
  field: string;
}) => {
  const { t } = useTranslation();
  const pending = !order.status;
  const filled = order.status === "filled";
  switch (field) {
    case "symbol":
      return <PredictionOrderSymbol order={order} />;
    case "side":
      return <OutcomeBadge outcome={order.outcome} />;
    case "fill_quantity":
      return pending ? (
        <PendingValue state={state} order={order} field="quantity" />
      ) : (
        <span>
          <TableNumber value={filled ? order.quantity : 0} /> /{" "}
          <TableNumber value={order.quantity} />
        </span>
      );
    case "quantity":
      return <TableNumber value={order.quantity} />;
    case "price":
      return pending ? (
        <PendingValue state={state} order={order} field="price" />
      ) : order.type === "market" ? (
        t("common.market")
      ) : (
        <TableNumber value={order.price} />
      );
    case "average_executed_price":
      return filled ? <TableNumber value={order.price} /> : "--";
    case "executed":
    case "notional":
      return (
        <TableNumber
          value={new Decimal(pending || filled ? order.quantity : 0)
            .mul(order.price)
            .toNumber()}
          dp={2}
          suffix="USDC"
        />
      );
    case "status":
      return t(
        pending
          ? "orders.status.pending"
          : filled
            ? "prediction.status.filled"
            : "prediction.status.cancelled",
      );
    case "created_time":
      return formatTableTime(order.timestamp);
    case "action":
      return pending ? (
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={state.isRegionRestricted}
          onClick={() => state.cancelOrder(order.id)}
        >
          {t("common.cancel")}
        </Button>
      ) : null;
    default:
      return "--";
  }
};

export const PredictionOrdersTable = ({
  state,
  mode,
  status,
  leadingFilterItems,
  onLeadingFilter,
}: {
  state: PredictionState;
  mode: "pending" | "filled" | "history";
  status?: "cancelled" | "unsupported";
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
}) => {
  const { t } = useTranslation();
  const pending = mode === "pending";
  const filters = usePredictionFilters(mode === "history");
  const orderColumns = useOrderColumn({
    _type: pending
      ? TabType.pending
      : mode === "filled"
        ? TabType.filled
        : TabType.all,
    includePrediction: true,
  });
  const records = pending
    ? state.openOrders
    : mode === "filled"
      ? state.history.filter((order) => order.status === "filled")
      : [...state.openOrders, ...state.history];
  return (
    <PredictionDataTable
      minWidth={orderColumns.reduce(
        (width, column) => width + Number(column.width ?? 130),
        0,
      )}
      columns={orderColumns.map((column) =>
        tableColumn(column.title, Number(column.width ?? 130), {
          fixed:
            column.fixed === "left"
              ? "start"
              : column.fixed === "right"
                ? "end"
                : column.fixed,
          align: column.align,
          type: column.type === "action" ? "action" : "data",
        }),
      )}
      toolbar={
        <PredictionFilters
          filters={filters}
          mode={mode}
          leadingItems={leadingFilterItems}
          onLeadingFilter={onLeadingFilter}
          trailing={
            pending ? (
              <Button
                size="xs"
                variant="outlined"
                color="secondary"
                disabled={!state.openOrders.length || state.isRegionRestricted}
                onClick={state.cancelAllOrders}
              >
                {t("orders.cancelAll")}
              </Button>
            ) : undefined
          }
        />
      }
      rows={records
        .filter(
          (order) =>
            !status ||
            (status === "cancelled" &&
              "status" in order &&
              order.status === "cancelled"),
        )
        .filter((order) =>
          filters.matches({
            ...order,
            status: "status" in order ? String(order.status) : "pending",
          }),
        )
        .map((order) => ({
          id: String(order.id),
          cells: orderColumns.map((column) => (
            <PredictionOrderCell
              key={String(column.dataIndex)}
              state={state}
              order={order}
              field={String(column.dataIndex)}
            />
          )),
        }))}
    />
  );
};

type ProductOrderMode = "pending" | "filled" | "history";
type ProductOrderInstrument = "all" | ProductType;

const AllProductOrdersTable: React.FC<{
  state: PredictionState;
  mode: ProductOrderMode;
  includePrediction: boolean;
  productFilterItems: DataFilterItem[];
  onProductFilter: (filter: { name: string; value: unknown }) => void;
}> = ({
  state,
  mode,
  includePrediction,
  productFilterItems,
  onProductFilter,
}) => {
  const pending = mode === "pending";
  const type = pending
    ? TabType.pending
    : mode === "filled"
      ? TabType.filled
      : TabType.orderHistory;
  const orderListState = useOrderListScript({
    type,
    ordersStatus: pending
      ? OrderStatus.INCOMPLETE
      : mode === "filled"
        ? OrderStatus.FILLED
        : undefined,
  });
  const predictionOrders = pending
    ? state.openOrders
    : mode === "filled"
      ? state.history.filter((order) => order.status === "filled")
      : [...state.openOrders, ...state.history];

  return (
    <DesktopOrderList
      {...orderListState}
      additionalFilterItems={productFilterItems}
      onAdditionalFilter={onProductFilter}
      supplementalRows={
        includePrediction
          ? predictionOrders.map((order) => ({
              id: `prediction-${order.id}`,
              timestamp: order.timestamp,
              renderCell: (field) => (
                <PredictionOrderCell
                  state={state}
                  order={order}
                  field={field}
                />
              ),
            }))
          : undefined
      }
    />
  );
};

export const SharedProductOrdersPanel: React.FC<{
  state: PredictionState;
  mode: ProductOrderMode;
}> = ({ state, mode }) => {
  const { t } = useTranslation();
  const [instrument, setInstrument] = useState<ProductOrderInstrument>("all");
  const productFilterItems: DataFilterItem[] = [
    {
      type: "select",
      name: "instrument",
      value: instrument,
      options: [
        { label: t("prediction.filter.allInstruments"), value: "all" },
        { label: t("common.perps"), value: "perps" },
        { label: t("prediction.title"), value: "prediction" },
      ],
    },
  ];
  const onProductFilter = ({ value }: { name: string; value: unknown }) => {
    if (value === "all" || value === "perps" || value === "prediction") {
      setInstrument(value);
    }
  };

  if (instrument === "prediction") {
    return (
      <PredictionOrdersTable
        state={state}
        mode={mode}
        leadingFilterItems={productFilterItems}
        onLeadingFilter={onProductFilter}
      />
    );
  }

  if (instrument === "perps") {
    return (
      <AllProductOrdersTable
        state={state}
        mode={mode}
        includePrediction={false}
        productFilterItems={productFilterItems}
        onProductFilter={onProductFilter}
      />
    );
  }

  return (
    <AllProductOrdersTable
      state={state}
      mode={mode}
      includePrediction
      productFilterItems={productFilterItems}
      onProductFilter={onProductFilter}
    />
  );
};

const PredictionHistoryTable = ({
  state,
  leadingFilterItems,
  onLeadingFilter,
}: {
  state: PredictionState;
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
}) => {
  const { t } = useTranslation();
  const filters = usePredictionFilters(true);
  return (
    <PredictionDataTable
      minWidth={1400}
      toolbar={
        <PredictionFilters
          filters={filters}
          mode="settlements"
          leadingItems={leadingFilterItems}
          onLeadingFilter={onLeadingFilter}
        />
      }
      columns={[
        tableColumn(t("common.symbol"), 250, { fixed: "start" }),
        tableColumn(t("prediction.outcome"), 100),
        tableColumn(t("prediction.closedQuantity"), 130),
        tableColumn(t("prediction.avgEntryPrice"), 140),
        tableColumn(t("prediction.exitSettlementPrice"), 170),
        tableColumn(t("prediction.result"), 130),
        tableColumn(t("positions.history.column.netPnl"), 140, {
          sortable: true,
        }),
        tableColumn(t("prediction.closedSettledTime"), 180, { sortable: true }),
      ]}
      rows={state.settlements
        .filter((record) =>
          filters.matches({
            outcome: record.outcome,
            status: record.result === "closed" ? "closed" : "settled",
            timestamp: record.settledAt,
          }),
        )
        .map((record) => ({
          id: String(record.id),
          sortValues: [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            record.pnl,
            record.settledAt,
          ],
          cells: [
            <RoundSymbol round={record.round} outcome={record.outcome} />,
            <OutcomeBadge outcome={record.outcome} />,
            <TableNumber value={record.quantity} />,
            <TableNumber value={record.averagePrice} />,
            <div>
              <TableNumber value={record.settlementPrice} />
              <div className="oui-text-base-contrast-54">
                {t(
                  record.result === "closed"
                    ? "prediction.exitPrice"
                    : "prediction.settlementPrice",
                )}
              </div>
            </div>,
            record.result === "closed" ? (
              t("prediction.closed")
            ) : (
              <OutcomeBadge outcome={record.result ?? record.outcome} />
            ),
            <Text.pnl dp={2} coloring>
              {record.pnl}
            </Text.pnl>,
            formatTableTime(record.settledAt),
          ],
        }))}
    />
  );
};

const AssetsTable: React.FC<{ state: PredictionState }> = ({ state }) => {
  const { t } = useTranslation();
  const assets = [
    {
      asset: "USDC",
      quantity: state.balance,
      indexPrice: 1,
      assetValue: state.balance,
      collateralRatio: 1,
      collateralContribution: state.balance,
    },
    {
      asset: "BTC",
      quantity: 0.0184,
      indexPrice: state.currentPrice,
      assetValue: new Decimal(0.0184).mul(state.currentPrice).toNumber(),
      collateralRatio: 0.95,
      collateralContribution: new Decimal(0.0184)
        .mul(state.currentPrice)
        .mul(0.95)
        .toNumber(),
    },
  ];
  return (
    <PredictionDataTable
      minWidth={1130}
      columns={[
        tableColumn(t("portfolio.overview.column.token"), 150, {
          fixed: "start",
          sortable: true,
        }),
        tableColumn(t("portfolio.overview.column.qty"), 140, {
          sortable: true,
        }),
        tableColumn(t("portfolio.overview.column.indexPrice"), 140, {
          sortable: true,
        }),
        tableColumn(t("portfolio.overview.column.assetValue"), 140, {
          sortable: true,
        }),
        tableColumn(t("portfolio.overview.column.collateralRatio"), 140, {
          sortable: true,
        }),
        tableColumn(t("transfer.deposit.collateralContribution"), 140, {
          sortable: true,
        }),
        tableColumn("", 180, {
          align: "right",
          fixed: "end",
          type: "action",
        }),
      ]}
      rows={assets.map((item) => ({
        id: item.asset,
        sortValues: [
          item.asset,
          item.quantity,
          item.indexPrice,
          item.assetValue,
          item.collateralRatio,
          item.collateralContribution,
          undefined,
        ],
        cells: [
          <span className="oui-flex oui-items-center oui-gap-2 oui-text-base-contrast">
            <TokenIcon name={item.asset} size="sm" />
            {item.asset}
          </span>,
          <TableNumber value={item.quantity} />,
          <TableNumber value={item.indexPrice} dp={6} prefix="$" />,
          <TableNumber value={item.assetValue} dp={6} prefix="$" />,
          <TableNumber value={item.collateralRatio * 100} dp={2} suffix="%" />,
          <TableNumber value={item.collateralContribution} dp={6} prefix="$" />,
          <span className="oui-flex oui-items-center oui-justify-end oui-gap-3">
            {item.asset !== "USDC" && (
              <Button
                size="sm"
                variant="outlined"
                color="secondary"
                onClick={() => state.triggerMockAssetAction("convert")}
              >
                {t("transfer.convert")}
              </Button>
            )}
            <Button
              size="sm"
              variant="outlined"
              color="secondary"
              onClick={() => state.triggerMockAssetAction("transfer")}
            >
              {t("common.transfer")}
            </Button>
          </span>,
        ],
      }))}
    />
  );
};

/* eslint-enable react/jsx-key */

export const PredictionPlayground: React.FC<
  Pick<
    PredictionState,
    | "roundPhase"
    | "setRoundPhase"
    | "roundView"
    | "setRoundView"
    | "prototypeAuthState"
    | "setPrototypeAuthState"
    | "prototypeRegionState"
    | "setPrototypeRegionState"
  >
> = ({
  roundPhase,
  setRoundPhase,
  roundView,
  setRoundView,
  prototypeAuthState,
  setPrototypeAuthState,
  prototypeRegionState,
  setPrototypeRegionState,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const phases: PredictionRoundPhase[] =
    roundView === "past"
      ? ["resolving", "resolvedUp", "resolvedDown"]
      : ["trading"];
  const authStates: PredictionPrototypeAuthState[] = [
    "disconnected",
    "connected",
    "accountReady",
    "funded",
  ];
  const regionStates: PredictionPrototypeRegionState[] = [
    "allowed",
    "restricted",
  ];

  return (
    <div className="oui-fixed oui-bottom-4 oui-end-4 oui-z-50">
      {open && (
        <div className="oui-absolute oui-bottom-14 oui-end-0 oui-max-h-[calc(100vh-88px)] oui-w-64 oui-overflow-y-auto oui-rounded-xl oui-border oui-border-line-12 oui-bg-base-5 oui-p-2 oui-shadow-xl">
          <div className="oui-px-2 oui-py-1.5 oui-text-xs oui-font-semibold oui-text-base-contrast">
            {t("prediction.playground")}
          </div>
          <div className="oui-mb-1 oui-mt-1 oui-px-2 oui-text-3xs oui-font-semibold oui-uppercase oui-text-base-contrast-36">
            {t("prediction.playground.roundView")}
          </div>
          <div className="oui-space-y-1">
            {(["past", "live", "future"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setRoundView(view)}
                className={cn(
                  "oui-flex oui-w-full oui-items-center oui-justify-between oui-rounded-lg oui-px-2 oui-py-2 oui-text-start oui-text-xs oui-transition-colors",
                  roundView === view
                    ? "oui-bg-base-6 oui-text-base-contrast"
                    : "oui-text-base-contrast-54 hover:oui-bg-base-6 hover:oui-text-base-contrast-80",
                )}
              >
                {t(`prediction.playground.view.${view}`)}
                {roundView === view && (
                  <span className="oui-size-1.5 oui-rounded-full oui-bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="oui-mb-1 oui-mt-3 oui-border-t oui-border-line-12 oui-px-2 oui-pt-3 oui-text-3xs oui-font-semibold oui-uppercase oui-text-base-contrast-36">
            {t("prediction.playground.round")}
          </div>
          <div className="oui-space-y-1">
            {phases.map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() => setRoundPhase(phase)}
                className={cn(
                  "oui-flex oui-w-full oui-items-center oui-justify-between oui-rounded-lg oui-px-2 oui-py-2 oui-text-start oui-text-xs oui-transition-colors",
                  roundPhase === phase
                    ? "oui-bg-base-6 oui-text-base-contrast"
                    : "oui-text-base-contrast-54 hover:oui-bg-base-6 hover:oui-text-base-contrast-80",
                )}
              >
                {t(`prediction.playground.phase.${phase}`)}
                {roundPhase === phase && (
                  <span className="oui-size-1.5 oui-rounded-full oui-bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="oui-mb-1 oui-mt-3 oui-border-t oui-border-line-12 oui-px-2 oui-pt-3 oui-text-3xs oui-font-semibold oui-uppercase oui-text-base-contrast-36">
            {t("prediction.playground.auth")}
          </div>
          <div className="oui-space-y-1">
            {authStates.map((authState) => (
              <button
                key={authState}
                type="button"
                onClick={() => setPrototypeAuthState(authState)}
                className={cn(
                  "oui-flex oui-w-full oui-items-center oui-justify-between oui-rounded-lg oui-px-2 oui-py-2 oui-text-start oui-text-xs oui-transition-colors",
                  prototypeAuthState === authState
                    ? "oui-bg-base-6 oui-text-base-contrast"
                    : "oui-text-base-contrast-54 hover:oui-bg-base-6 hover:oui-text-base-contrast-80",
                )}
              >
                {t(`prediction.playground.auth.${authState}`)}
                {prototypeAuthState === authState && (
                  <span className="oui-size-1.5 oui-rounded-full oui-bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="oui-mb-1 oui-mt-3 oui-border-t oui-border-line-12 oui-px-2 oui-pt-3 oui-text-3xs oui-font-semibold oui-uppercase oui-text-base-contrast-36">
            {t("prediction.playground.region")}
          </div>
          <div className="oui-space-y-1">
            {regionStates.map((regionState) => (
              <button
                key={regionState}
                type="button"
                onClick={() => setPrototypeRegionState(regionState)}
                className={cn(
                  "oui-flex oui-w-full oui-items-center oui-justify-between oui-rounded-lg oui-px-2 oui-py-2 oui-text-start oui-text-xs oui-transition-colors",
                  prototypeRegionState === regionState
                    ? "oui-bg-base-6 oui-text-base-contrast"
                    : "oui-text-base-contrast-54 hover:oui-bg-base-6 hover:oui-text-base-contrast-80",
                )}
              >
                {t(`prediction.playground.region.${regionState}`)}
                {prototypeRegionState === regionState && (
                  <span className="oui-size-1.5 oui-rounded-full oui-bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <Button
        size="md"
        color="primary"
        className="oui-shadow-xl"
        onClick={() => setOpen((visible) => !visible)}
      >
        {t("prediction.playground")}
      </Button>
    </div>
  );
};

type PredictionMarketRowProps = Pick<
  PredictionState,
  "countdown" | "isRoundTradable" | "outcomePrices" | "round" | "upChance"
> & {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
  showFavoriteControl?: boolean;
};

const PredictionMarketPanel: React.FC<
  PredictionMarketRowProps & { className?: string }
> = ({ className, ...props }) => {
  const { t } = useTranslation();
  const { searchValue } = useMarketsContext();
  const searchableText = `${t("prediction.btcUpDown")} BTC UP DOWN 5M`;
  const matchesSearch =
    !searchValue ||
    searchableText.toLowerCase().includes(searchValue.trim().toLowerCase());

  type PredictionMarketRecord = {
    symbol: string;
    chance: number;
    lastPrice: number;
    volume: number;
    time: string;
  };

  const columns = useMemo<Column<PredictionMarketRecord>[]>(
    () => [
      {
        title: t("common.symbol"),
        dataIndex: "symbol",
        width: 190,
        onSort: true,
        render: () => (
          <div className="oui-flex oui-min-w-0 oui-items-center oui-gap-2">
            {props.showFavoriteControl !== false && (
              <button
                type="button"
                aria-label={t("markets.favorites")}
                onClick={(event) => {
                  event.stopPropagation();
                  props.onToggleFavorite();
                }}
                className="oui-prediction-market-favorite-btn oui-me-1 oui-flex oui-size-3 oui-flex-none oui-cursor-pointer oui-items-center oui-justify-center"
              >
                {props.isFavorite ? (
                  <FavoritesIcon2 className="oui-size-3" />
                ) : (
                  <UnFavoritesIcon2 className="oui-size-3" />
                )}
              </button>
            )}
            <TokenIcon name="BTC" className="oui-size-[18px]" />
            <Text
              size="2xs"
              className="oui-whitespace-nowrap oui-text-base-contrast"
            >
              {t("prediction.btcUpDown")}
            </Text>
          </div>
        ),
      },
      {
        title: t("markets.column.last"),
        dataIndex: "lastPrice",
        width: 100,
        align: "right",
        onSort: true,
        render: (value) => <Text size="2xs">{formatContractPrice(value)}</Text>,
      },
      {
        title: t("prediction.chance"),
        dataIndex: "chance",
        width: 80,
        align: "right",
        onSort: true,
        render: (value) => <Text size="2xs">{formatPercent(value)}</Text>,
      },
      {
        title: t("prediction.volumeShort"),
        dataIndex: "volume",
        width: 80,
        align: "right",
        onSort: true,
        render: () => <Text size="2xs">$6,117,054</Text>,
      },
      {
        title: t("common.time"),
        dataIndex: "time",
        width: 80,
        align: "right",
        onSort: true,
        render: (value) => <Text size="2xs">{value}</Text>,
      },
    ],
    [props.isFavorite, props.onToggleFavorite, props.round, t],
  );

  const dataSource: PredictionMarketRecord[] = matchesSearch
    ? [
        {
          symbol: PREDICTION_MARKET_ID,
          chance: props.upChance,
          lastPrice: props.outcomePrices.up,
          volume: 6_117_054,
          time: props.isRoundTradable
            ? formatCountdown(props.countdown)
            : "00:00",
        },
      ]
    : [];

  return (
    <div
      className={cn(
        "oui-relative oui-z-[3] oui-overflow-hidden oui-bg-base-8 oui-px-1 oui-pb-2",
        className,
      )}
    >
      <DataTable
        columns={columns}
        dataSource={dataSource}
        generatedRowKey={(record) => record.symbol}
        classNames={{
          root: "!oui-h-auto !oui-bg-base-8",
          scroll: "!oui-h-auto !oui-min-h-0",
          header: "oui-h-9",
        }}
        onRow={() => ({
          className: "oui-prediction-market-row !oui-h-[34px]",
          onClick: props.onSelect,
        })}
      />
    </div>
  );
};

export const Prediction: React.FC<
  PredictionState & {
    accountPanel?: React.ReactNode;
    orderEntryAccountReady?: boolean;
    orderEntryFunded?: boolean;
    orderEntryRestricted?: boolean;
  }
> = (state) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!state.notification) return;

    const message = String(
      t(state.notification.message as keyof LocaleMessages),
    );
    if (state.notification.tone === "danger") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  }, [state.notification, t]);

  const [favoriteMarketIds, setFavoriteMarketIds] = useLocalStorage<string[]>(
    PREDICTION_FAVORITES_STORAGE_KEY,
    [],
  );
  const isPredictionFavorite = favoriteMarketIds.includes(PREDICTION_MARKET_ID);
  const togglePredictionFavorite = () => {
    setFavoriteMarketIds(
      isPredictionFavorite
        ? favoriteMarketIds.filter((id: string) => id !== PREDICTION_MARKET_ID)
        : [...favoriteMarketIds, PREDICTION_MARKET_ID],
    );
  };
  const predictionMarketRowProps: PredictionMarketRowProps = {
    countdown: state.countdown,
    isRoundTradable: state.isRoundTradable,
    outcomePrices: state.outcomePrices,
    round: state.round,
    upChance: state.upChance,
    isFavorite: isPredictionFavorite,
    onToggleFavorite: togglePredictionFavorite,
    onSelect: () => undefined,
  };
  // TODO: Wire cross-market navigation before the prototype is promoted.
  const handleDropdownSymbolChange = () => undefined;

  // Prediction favorites render as a separate section because they are not
  // part of the current Perps markets data source.

  // Regional restrictions come from the shared app provider and must always
  // take precedence over prototype-only authentication states.
  const hasPrototypeAuthOverride = state.prototypeAuthState !== "real";
  const effectiveAccountReady = state.orderEntryRestricted
    ? false
    : hasPrototypeAuthOverride
      ? state.prototypeAuthState === "accountReady" ||
        state.prototypeAuthState === "funded"
      : (state.orderEntryAccountReady ?? true);
  const effectiveAccountFunded = state.orderEntryRestricted
    ? false
    : hasPrototypeAuthOverride
      ? state.prototypeAuthState === "funded"
      : (state.orderEntryFunded ?? true);
  const accountPanel = hasPrototypeAuthOverride ? (
    state.prototypeAuthState === "funded" ? null : state.prototypeAuthState ===
      "real" ? null : (
      <PrototypeAuthPrompt state={state.prototypeAuthState} />
    )
  ) : (
    state.accountPanel
  );

  return (
    <main
      id="oui-prediction-page"
      className="oui-min-h-[calc(100vh-64px)] oui-bg-base-10 oui-p-3 oui-font-semibold lg:oui-p-4"
    >
      <div className="oui-grid oui-gap-3 md:oui-grid-cols-2 md:oui-items-stretch xl:oui-min-h-[calc(100vh-96px)] xl:oui-grid-cols-[minmax(0,1fr)_280px_360px] xl:oui-grid-rows-[auto_auto_minmax(350px,1fr)]">
        <header className="oui-flex oui-flex-col oui-gap-4 oui-rounded-2xl oui-bg-base-9 oui-p-4 md:oui-col-span-2 md:oui-col-start-1 md:oui-row-start-1 xl:oui-col-span-1 xl:oui-col-start-1 xl:oui-row-start-1 2xl:oui-flex-row 2xl:oui-items-center">
          <DropDownMarketsWidget
            symbol="PERP_BTC_USDC"
            tabs={predictionMarketTabs}
            contentClassName="oui-h-[560px] oui-w-[920px] oui-max-w-[calc(100vw-24px)]"
            onSymbolChange={handleDropdownSymbolChange}
            renderTabContent={(_, key, hide) =>
              key === "prediction" ? (
                <PredictionMarketPanel
                  {...predictionMarketRowProps}
                  onSelect={hide}
                />
              ) : undefined
            }
            renderTabAfterContent={(_, key, hide) =>
              key === "favorites" && isPredictionFavorite ? (
                <PredictionMarketPanel
                  {...predictionMarketRowProps}
                  className="oui-flex-none oui-border-t oui-border-line-12 oui-pt-2"
                  showFavoriteControl={false}
                  onSelect={hide}
                />
              ) : null
            }
          >
            <button
              type="button"
              className="oui-flex oui-min-w-0 oui-items-center oui-gap-3 oui-text-start 2xl:oui-w-[340px] 2xl:oui-shrink-0"
            >
              <TokenIcon name="BTC" size="lg" />
              <div className="oui-min-w-0 oui-flex-1">
                <h1 className="oui-flex oui-items-center oui-gap-1 oui-truncate oui-text-base oui-font-semibold oui-text-base-contrast">
                  <span className="oui-truncate">
                    {t("prediction.btcUpDown")}
                  </span>
                  <TriangleDownIcon className="oui-flex-none oui-text-base-contrast-54" />
                </h1>
                <div className="oui-mt-0.5 oui-truncate oui-text-xs oui-font-normal oui-text-base-contrast-54">
                  {formatRoundWindow(state.round)}
                </div>
              </div>
            </button>
          </DropDownMarketsWidget>

          <div className="oui-hidden oui-h-12 oui-w-px oui-shrink-0 oui-bg-line-12 2xl:oui-block" />

          <div className="oui-hidden oui-min-w-0 oui-flex-1 oui-grid-cols-2 oui-items-center oui-gap-x-6 oui-gap-y-3 sm:oui-grid-cols-3 xl:oui-grid 2xl:oui-flex 2xl:oui-flex-wrap 2xl:oui-gap-x-8">
            <DataItem
              label={t("prediction.chart.btcPrice")}
              value={<Text.numeral dp={2}>{state.currentPrice}</Text.numeral>}
            />
            <DataItem
              label={t("prediction.chance")}
              value={
                <Text intensity={98}>{formatPercent(state.upChance)}</Text>
              }
            />
          </div>
        </header>

        <div className="oui-min-w-0 md:oui-col-span-2 md:oui-col-start-1 md:oui-row-start-2 xl:oui-col-span-1 xl:oui-col-start-1 xl:oui-row-start-2">
          <MobileMarketPanel {...state} />
          <div className="oui-hidden xl:oui-block">
            <PriceChart
              selectedRound={state.selectedRound}
              onSelectRound={state.selectMarketRound}
              points={state.priceHistory}
              openingPrice={state.openingPrice}
              currentPrice={state.currentPrice}
              round={state.round}
              countdown={state.countdown}
              roundPhase={state.roundPhase}
              onGoToLiveMarket={state.goToLiveRound}
            />
          </div>
        </div>
        <div className="oui-min-w-0 md:oui-col-start-1 md:oui-row-start-3 xl:oui-col-start-2 xl:oui-row-span-2 xl:oui-row-start-1">
          <PredictionOrderBook
            orderBook={state.orderBook}
            selectedOutcome={state.selectedOutcome}
            selectedPrice={state.selectedPrice}
            setLimitPrice={state.setLimitPrice}
            setOrderType={state.setOrderType}
            isRoundTradable={state.isRoundTradable}
            roundPhase={state.roundPhase}
          />
        </div>
        <div
          className={cn(
            "oui-space-y-3 md:oui-col-start-2 md:oui-row-start-3 xl:oui-col-start-3 xl:oui-row-span-3 xl:oui-row-start-1",
            (state.isRegionRestricted || state.orderEntryRestricted) &&
              "oui-flex oui-flex-col oui-self-stretch xl:oui-block",
          )}
        >
          {accountPanel && (
            <div className="oui-rounded-2xl oui-border oui-border-line-12 oui-bg-base-9 oui-p-3">
              {accountPanel}
            </div>
          )}
          {state.isRegionRestricted || state.orderEntryRestricted ? (
            <RoundOrderStatusCard
              round={state.selectedRound}
              roundPhase={state.roundPhase}
              restricted
            />
          ) : state.isRoundTradable ? (
            <TradePanel
              {...state}
              orderEntryAccountReady={effectiveAccountReady}
              orderEntryFunded={effectiveAccountFunded}
            />
          ) : (
            <RoundOrderStatusCard
              round={state.round}
              roundPhase={state.roundPhase}
            />
          )}
        </div>
        <div className="oui-min-w-0 md:oui-col-span-2 md:oui-col-start-1 md:oui-row-start-4 xl:oui-row-start-3">
          <PredictionDataPanel state={state} />
        </div>
      </div>
      <PredictionPlayground
        roundView={state.roundView}
        setRoundView={state.setRoundView}
        roundPhase={state.roundPhase}
        setRoundPhase={state.setRoundPhase}
        prototypeAuthState={state.prototypeAuthState}
        setPrototypeAuthState={state.setPrototypeAuthState}
        prototypeRegionState={state.prototypeRegionState}
        setPrototypeRegionState={state.setPrototypeRegionState}
      />
    </main>
  );
};
