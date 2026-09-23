import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Badge, cn, Text } from "@orderly.network/ui";
import type { PredictionOutcome, PredictionState } from "../prediction.script";
import { usePredictionFormatters } from "../predictionShared";

export const OutcomeBadge: React.FC<{ outcome: PredictionOutcome }> = ({
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

export const RoundSymbol = ({
  round,
  outcome,
}: {
  round: number;
  outcome: PredictionOutcome;
}) => {
  const { t } = useTranslation();
  const { formatRoundBadge } = usePredictionFormatters();
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

export const PredictionOrderSymbol = ({
  order,
}: {
  order: PredictionState["openOrders"][number];
}) => {
  const { t } = useTranslation();
  const { formatRoundBadge } = usePredictionFormatters();
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
