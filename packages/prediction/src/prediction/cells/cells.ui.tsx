import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Badge, cn, Text } from "@orderly.network/ui";
import { type BinaryInfoRow } from "../binary/binaryInfo";
import { parseBinaryRoundSymbol } from "../binary/binaryMarkets";
import { secondsUntil } from "../binary/binaryRoundView";
import { useRoundNow } from "../hooks/useRoundCountdown";
import type {
  PredictionOutcome,
  PredictionResult,
  PredictionAccountState,
} from "../prediction.types";
import {
  orderTypeLabels,
  outcomeLabels,
  resultLabels,
} from "../predictionLabels";
import {
  formatCountdown,
  formatPredictionPnl,
  usePredictionFormatters,
} from "../predictionShared";

export const OutcomeBadge: React.FC<{
  outcome: PredictionResult;
  muted?: boolean;
}> = ({ outcome, muted }) => {
  useTranslation();
  return (
    <Badge
      className={cn(
        "oui-prediction-outcomeBadge oui-uppercase",
        muted && "oui-text-base-contrast-20",
      )}
      color={
        muted || outcome === "tie"
          ? "neutral"
          : outcome === "up"
            ? "buy"
            : "sell"
      }
      size="xs"
    >
      {resultLabels()[outcome]}
    </Badge>
  );
};

export const TableNumber: React.FC<{
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

/** Format from the original PnL so small profits and losses retain their value. */
export const PredictionPnl: React.FC<{ value: number }> = ({ value }) => (
  <Text
    dir="ltr"
    className="oui-break-all oui-tabular-nums"
    color={
      !Number.isFinite(value)
        ? "inherit"
        : value === 0
          ? "neutral"
          : value < 0
            ? "lose"
            : "profit"
    }
  >
    {formatPredictionPnl(value)}
  </Text>
);

export const RoundSymbol = ({
  round,
  outcome,
  symbol,
  onSelectRoundSymbol,
}: {
  round: number;
  outcome: PredictionOutcome;
  symbol?: string;
  /** Selects the record's market and round; absent or unparseable symbol renders plain display. */
  onSelectRoundSymbol?: (symbol: string) => void;
}) => {
  const { t } = useTranslation();
  const { formatRoundBadge } = usePredictionFormatters();
  const market = parseBinaryRoundSymbol(symbol);
  const onClick =
    symbol && onSelectRoundSymbol
      ? () => onSelectRoundSymbol(symbol)
      : undefined;
  return (
    <div
      className={cn(
        "oui-flex oui-items-center oui-gap-2 oui-whitespace-nowrap oui-py-1",
        onClick && "oui-cursor-pointer",
      )}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      <span
        aria-hidden="true"
        className={cn(
          "oui-h-[42px] oui-w-1 oui-shrink-0 oui-rounded-[1px]",
          outcome === "up" ? "oui-bg-trade-profit" : "oui-bg-trade-loss",
        )}
      />
      <div>
        <div>
          {market ? t("prediction.marketName", market) : t("prediction.title")}
        </div>
        <div className="oui-mt-1 oui-tabular-nums oui-text-base-contrast-54">
          {formatRoundBadge(round, market?.intervalSeconds)}
        </div>
      </div>
    </div>
  );
};

export const PredictionOrderSymbol = ({
  order,
  onSelectRoundSymbol,
}: {
  order: PredictionAccountState["openOrders"][number];
  /** Selects the record's market and round; absent symbol renders plain display. */
  onSelectRoundSymbol?: (symbol: string) => void;
}) => {
  const { t } = useTranslation();
  const { formatRoundBadge } = usePredictionFormatters();
  const market = parseBinaryRoundSymbol(order.symbol);
  const { symbol } = order;
  const onClick =
    symbol && onSelectRoundSymbol
      ? () => onSelectRoundSymbol(symbol)
      : undefined;
  return (
    <div
      className={cn(
        "oui-flex oui-items-center oui-gap-2 oui-py-1",
        onClick && "oui-cursor-pointer",
      )}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      <span
        aria-label={outcomeLabels()[order.outcome]}
        title={outcomeLabels()[order.outcome]}
        className={cn(
          "oui-h-[34px] oui-w-1 oui-shrink-0 oui-rounded-[1px]",
          order.outcome === "up" ? "oui-bg-trade-profit" : "oui-bg-trade-loss",
        )}
      />
      <div
        className={cn(
          "oui-min-w-0",
          order.status === "cancelled"
            ? "oui-text-base-contrast-20"
            : "oui-text-base-contrast",
        )}
      >
        <div className="oui-whitespace-nowrap">
          {market ? t("prediction.marketName", market) : t("prediction.title")}
        </div>
        <div className="oui-mt-1 oui-flex oui-items-center oui-gap-1 oui-whitespace-nowrap">
          <Badge color="neutral" size="xs">
            {orderTypeLabels()[order.type]}
          </Badge>
          <span
            className={cn(
              "oui-whitespace-nowrap oui-tabular-nums",
              order.status === "cancelled"
                ? "oui-text-base-contrast-20"
                : "oui-text-base-contrast-54",
            )}
          >
            {formatRoundBadge(order.round, market?.intervalSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Per-row calibrated countdown, independent of the selected round. */
export const RoundCountdown: React.FC<{
  roundInfo: BinaryInfoRow | undefined;
}> = ({ roundInfo }) => {
  useTranslation();
  const now = useRoundNow(roundInfo?.expire_at);
  if (!roundInfo) return <Text intensity={36}>--</Text>;
  return Number.isFinite(roundInfo.expire_at) && roundInfo.expire_at > now ? (
    formatCountdown(secondsUntil(roundInfo.expire_at, now))
  ) : (
    <Text intensity={36}>--</Text>
  );
};
