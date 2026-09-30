import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Divider, EmptyDataState, Text } from "@orderly.network/ui";
import { AuthGuardEmpty, useAuthGuard } from "@orderly.network/ui-connector";
import { Decimal } from "@orderly.network/utils";
import {
  OutcomeBadge,
  PredictionOrderSymbol,
  RoundSymbol,
  TableNumber,
} from "../cells";
import { useRoundCountdown } from "../hooks/useRoundCountdown";
import { SellPosition } from "../orderEntry/sellPosition";
import type { PredictionState } from "../prediction.script";
import { formatCountdown, usePredictionFormatters } from "../predictionShared";
import { PredictionFilters } from "./filters/predictionFilters.ui";
import { usePredictionHistoryTableScript } from "./history/predictionHistoryTable.script";
import { useHoldingsTableScript } from "./holdings/holdingsTable.script";
import { PredictionOrderCell } from "./orders/predictionOrderCell.ui";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="oui-min-w-0">
    <div className="oui-text-2xs oui-text-base-contrast-54">{label}</div>
    <div className="oui-mt-1 oui-text-sm oui-text-base-contrast">
      {children}
    </div>
  </div>
);

const Cards: React.FC<{ children: React.ReactNode; empty: boolean }> = ({
  children,
  empty,
}) => {
  const authorized = useAuthGuard();
  if (!authorized) return <AuthGuardEmpty />;
  if (empty)
    return (
      <div className="oui-py-8">
        <EmptyDataState />
      </div>
    );
  return <div className="oui-space-y-2 oui-p-2">{children}</div>;
};

export const MobilePredictionPositions: React.FC<{
  state: PredictionState;
}> = ({ state }) => {
  const { t } = useTranslation();
  const { filters } = useHoldingsTableScript();
  const countdown = useRoundCountdown(state.selectedRow?.expire_at);
  const positions = state.positions.filter(filters.matches);
  return (
    <>
      <PredictionFilters filters={filters} mode="holdings" />
      <Cards empty={positions.length === 0}>
        {positions.map((position) => {
          // Only the selected round has a subscribed book for live valuation.
          const isSelectedRound = position.symbol === state.selectedRow?.symbol;
          const lastPrice = isSelectedRound
            ? state.outcomePrices[position.outcome]
            : undefined;
          const pnl =
            lastPrice != null
              ? new Decimal(lastPrice)
                  .sub(position.averagePrice)
                  .mul(position.quantity)
                  .toNumber()
              : undefined;
          return (
            <div
              key={`${position.symbol ?? ""}-${position.outcome}`}
              className="oui-rounded-xl oui-bg-base-9 oui-p-3"
            >
              <div className="oui-flex oui-items-start oui-justify-between oui-gap-2">
                <RoundSymbol
                  round={position.round ?? state.round}
                  outcome={position.outcome}
                  symbol={position.symbol}
                />
                <OutcomeBadge outcome={position.outcome} />
              </div>
              <Divider intensity={6} className="oui-my-2 oui-w-full" />
              <div className="oui-grid oui-grid-cols-2 oui-gap-3">
                <Field label={t("prediction.size")}>
                  <TableNumber value={position.quantity} />
                </Field>
                <Field label={t("common.available")}>
                  <TableNumber
                    value={state.availableQuantity(
                      position.outcome,
                      undefined,
                      position.symbol,
                    )}
                  />
                </Field>
                <Field label={t("prediction.entryPrice")}>
                  <TableNumber value={position.averagePrice} />
                </Field>
                <Field label={t("prediction.lastPrice")}>
                  {lastPrice != null ? (
                    <TableNumber value={lastPrice} />
                  ) : (
                    <Text intensity={36}>--</Text>
                  )}
                </Field>
                <Field label={t("common.unrealizedPnl")}>
                  {pnl != null ? (
                    <Text.pnl dp={2} coloring>
                      {pnl}
                    </Text.pnl>
                  ) : (
                    <Text intensity={36}>--</Text>
                  )}
                </Field>
                <Field label={t("prediction.countdownStatus")}>
                  {isSelectedRound
                    ? state.isRoundTradable
                      ? formatCountdown(countdown)
                      : t(`prediction.phase.${state.roundPhase}`)
                    : "--"}
                </Field>
              </div>
              <div className="oui-mt-3 oui-flex oui-justify-end">
                <SellPosition
                  state={state}
                  outcome={position.outcome}
                  symbol={position.symbol}
                />
              </div>
            </div>
          );
        })}
      </Cards>
    </>
  );
};

export const MobilePredictionHistory: React.FC<{ state: PredictionState }> = ({
  state,
}) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  const { filters } = usePredictionHistoryTableScript();
  const records = state.settlements.filter((record) =>
    filters.matches({
      outcome: record.outcome,
      status: record.result === "closed" ? "closed" : "settled",
      timestamp: record.settledAt,
    }),
  );
  return (
    <>
      <PredictionFilters filters={filters} mode="settlements" />
      <Cards empty={records.length === 0}>
        {records.map((record) => (
          <div key={record.id} className="oui-rounded-xl oui-bg-base-9 oui-p-3">
            <div className="oui-flex oui-items-start oui-justify-between oui-gap-2">
              <RoundSymbol
                round={record.round}
                outcome={record.outcome}
                symbol={record.symbol}
              />
              <OutcomeBadge outcome={record.outcome} />
            </div>
            <Divider intensity={6} className="oui-my-2 oui-w-full" />
            <div className="oui-grid oui-grid-cols-2 oui-gap-3">
              <Field label={t("prediction.closedQuantity")}>
                <TableNumber value={record.quantity} />
              </Field>
              <Field label={t("prediction.avgEntryPrice")}>
                <TableNumber value={record.averagePrice} />
              </Field>
              <Field label={t("prediction.exitSettlementPrice")}>
                <TableNumber value={record.settlementPrice} />
              </Field>
              <Field label={t("prediction.result")}>
                {record.result === "closed" ? (
                  t("prediction.closed")
                ) : (
                  <OutcomeBadge outcome={record.result ?? record.outcome} />
                )}
              </Field>
              <Field label={t("positions.history.column.netPnl")}>
                {record.pnl != null ? (
                  <Text.pnl dp={2} coloring>
                    {record.pnl}
                  </Text.pnl>
                ) : (
                  <Text intensity={36}>--</Text>
                )}
              </Field>
              <Field label={t("prediction.closedSettledTime")}>
                {record.settledAt != null ? (
                  formatTableTime(record.settledAt)
                ) : (
                  <Text intensity={36}>--</Text>
                )}
              </Field>
            </div>
          </div>
        ))}
      </Cards>
    </>
  );
};

export const MobilePredictionOrderCard: React.FC<{
  state: PredictionState;
  order: PredictionState["openOrders"][number];
}> = ({ state, order }) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  return (
    <div className="oui-rounded-xl oui-bg-base-9 oui-p-3">
      <div className="oui-flex oui-items-start oui-justify-between oui-gap-2">
        <PredictionOrderSymbol order={order} />
        <span className="oui-text-2xs oui-text-base-contrast-54">
          {formatTableTime(order.timestamp)}
        </span>
      </div>
      <Divider intensity={6} className="oui-my-2 oui-w-full" />
      <div className="oui-grid oui-grid-cols-2 oui-gap-3">
        <Field label={t("prediction.outcome")}>
          <OutcomeBadge outcome={order.outcome} />
        </Field>
        <Field label={t("common.side")}>{t(`common.${order.side}`)}</Field>
        <Field label={t("prediction.filledQuantity")}>
          <PredictionOrderCell
            state={state}
            order={order}
            field="fill_quantity"
          />
        </Field>
        <Field label={t("prediction.filledOrderPrice")}>
          <PredictionOrderCell state={state} order={order} field="price" />
        </Field>
        <Field label={t("prediction.orderValue")}>
          <PredictionOrderCell state={state} order={order} field="notional" />
        </Field>
        <Field label={t("common.status")}>
          <PredictionOrderCell state={state} order={order} field="status" />
        </Field>
      </div>
      {(!order.status ||
        order.status === "pending" ||
        order.status === "partialFilled") && (
        <div className="oui-mt-3 oui-flex oui-justify-end">
          <PredictionOrderCell state={state} order={order} field="action" />
        </div>
      )}
    </div>
  );
};
