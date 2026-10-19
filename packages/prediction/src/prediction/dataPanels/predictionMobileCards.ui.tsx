import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Divider, EmptyDataState, Text } from "@orderly.network/ui";
import { AuthGuardEmpty, useAuthGuard } from "@orderly.network/ui-connector";
import {
  binaryOrderDisplaySide,
  binaryOrderOutcome,
  binaryOrderDisplayStatus,
} from "../binary/binaryOrderDisplay";
import {
  OutcomeBadge,
  PredictionOrderSymbol,
  PredictionPnl,
  RoundCountdown,
  RoundSymbol,
  TableNumber,
} from "../cells";
import { SellPosition } from "../orderEntry/sellPosition";
import type { PredictionAccountPanelState } from "../prediction.types";
import { sideLabels } from "../predictionLabels";
import { usePredictionFormatters } from "../predictionShared";
import { PredictionFilters } from "./filters/predictionFilters.ui";
import { usePredictionHistoryTableScript } from "./history/predictionHistoryTable.script";
import {
  useHoldingsPositionRows,
  useHoldingsTableScript,
} from "./holdings/holdingsTable.script";
import { PredictionOrderCell } from "./orders/predictionOrderCell.ui";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="oui-min-w-0">
    <div className="oui-text-2xs oui-text-base-contrast-54">{label}</div>
    <div className="oui-text-sm oui-mt-1 oui-text-base-contrast">
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
  state: PredictionAccountPanelState;
}> = ({ state }) => {
  const { t } = useTranslation();
  const { filters } = useHoldingsTableScript();
  const rows = useHoldingsPositionRows(state, filters.matches);
  return (
    <>
      <PredictionFilters
        filters={filters}
        mode="holdings"
        showOutcome={false}
      />
      <Cards empty={rows.length === 0}>
        {rows.map(
          ({
            id,
            position,
            lastPrice,
            uPnL,
            availableQuantity,
            roundInfo,
            resolvedOutcome,
          }) => (
            <div key={id} className="oui-rounded-xl oui-bg-base-9 oui-p-3">
              <div className="oui-flex oui-items-start oui-justify-between oui-gap-2">
                <RoundSymbol
                  round={position.round ?? state.marketView?.round ?? 0}
                  outcome={position.outcome}
                  symbol={position.symbol}
                  onSelectRoundSymbol={state.onSelectRoundSymbol}
                />
              </div>
              <Divider intensity={6} className="oui-my-2 oui-w-full" />
              <div className="oui-grid oui-grid-cols-2 oui-gap-3">
                <Field label={t("prediction.size")}>
                  <TableNumber value={position.quantity} />
                </Field>
                <Field label={t("common.available")}>
                  <TableNumber value={availableQuantity} />
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
                  {uPnL != null ? (
                    <PredictionPnl value={uPnL} />
                  ) : (
                    <Text intensity={36}>--</Text>
                  )}
                </Field>
                <Field label={t("common.countdown")}>
                  <RoundCountdown roundInfo={roundInfo} />
                </Field>
                <Field label={t("prediction.outcome")}>
                  {resolvedOutcome ? (
                    <OutcomeBadge outcome={resolvedOutcome} />
                  ) : (
                    <Text intensity={36}>--</Text>
                  )}
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
          ),
        )}
      </Cards>
    </>
  );
};

export const MobilePredictionHistory: React.FC<{
  state: PredictionAccountPanelState;
  predictionUnderlyingSymbol?: string;
}> = ({ state, predictionUnderlyingSymbol }) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  const { filters, historyState } = usePredictionHistoryTableScript(
    state,
    predictionUnderlyingSymbol,
  );
  const records = historyState.displayRecords;
  return (
    <>
      <PredictionFilters filters={filters} mode="settlements" />
      <Cards empty={records.length === 0}>
        {records.map((record) => (
          <div
            key={record.recordKey}
            className="oui-rounded-xl oui-bg-base-9 oui-p-3"
          >
            <div className="oui-flex oui-items-start oui-justify-between oui-gap-2">
              {record.outcome ? (
                <RoundSymbol
                  round={record.round}
                  outcome={record.outcome}
                  symbol={record.symbol}
                  onSelectRoundSymbol={state.onSelectRoundSymbol}
                />
              ) : (
                <Text>{record.symbol}</Text>
              )}
            </div>
            <Divider intensity={6} className="oui-my-2 oui-w-full" />
            <div className="oui-grid oui-grid-cols-2 oui-gap-3">
              <Field label={t("prediction.outcome")}>
                {record.resolvedOutcome ? (
                  <OutcomeBadge outcome={record.resolvedOutcome} />
                ) : (
                  <Text intensity={36}>--</Text>
                )}
              </Field>
              <Field label={t("prediction.closedQuantity")}>
                <TableNumber value={record.quantity} />
              </Field>
              <Field label={t("prediction.avgEntryPrice")}>
                <TableNumber value={record.averagePrice} />
              </Field>
              <Field label={t("prediction.exitSettlementPrice")}>
                <TableNumber value={record.settlementPrice} />
              </Field>
              <Field label={t("positions.history.column.netPnl")}>
                {record.pnl != null ? (
                  <PredictionPnl value={record.pnl} />
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
  state: PredictionAccountPanelState;
  order: PredictionAccountPanelState["openOrders"][number];
}> = ({ state, order }) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  return (
    <div className="oui-rounded-xl oui-bg-base-9 oui-p-3">
      <div className="oui-flex oui-items-start oui-justify-between oui-gap-2">
        <PredictionOrderSymbol
          order={order}
          onSelectRoundSymbol={state.onSelectRoundSymbol}
        />
        <span className="oui-text-2xs oui-text-base-contrast-54">
          {formatTableTime(order.created_time)}
        </span>
      </div>
      <Divider intensity={6} className="oui-my-2 oui-w-full" />
      <div className="oui-grid oui-grid-cols-2 oui-gap-3">
        <Field label={t("prediction.outcome")}>
          <OutcomeBadge outcome={binaryOrderOutcome(order)} />
        </Field>
        <Field label={t("common.side")}>
          {sideLabels()[binaryOrderDisplaySide(order)]}
        </Field>
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
        <Field label={t("prediction.avgFillPrice")}>
          <PredictionOrderCell
            state={state}
            order={order}
            field="average_executed_price"
          />
        </Field>
        <Field label={t("common.fee")}>
          <PredictionOrderCell state={state} order={order} field="total_fee" />
        </Field>
        <Field label={t("common.status")}>
          <PredictionOrderCell state={state} order={order} field="status" />
        </Field>
      </div>
      {(binaryOrderDisplayStatus(order) === "pending" ||
        binaryOrderDisplayStatus(order) === "partialFilled") && (
        <div className="oui-mt-3 oui-flex oui-justify-end">
          <PredictionOrderCell state={state} order={order} field="action" />
        </div>
      )}
    </div>
  );
};
