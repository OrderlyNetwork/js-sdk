import type { ReactNode } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, cn, Text } from "@orderly.network/ui";
import type { BinaryHistoryRecord } from "../binary/binaryHistory";
import type { BinaryInfoDetail } from "../binary/binaryInfo";
import {
  hasBinaryPriceEvidence,
  isBinarySettlementComplete,
} from "../binary/binarySettlement";
import { usePredictionFormatters } from "../predictionShared";
import type { RoundResultState } from "./roundResult.script";

const DetailRow = ({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) => (
  <div className="oui-text-xs oui-flex oui-items-start oui-justify-between oui-gap-3 oui-font-normal">
    <Text intensity={54}>{label}</Text>
    <div className="oui-min-w-0 oui-break-all oui-text-end oui-text-base-contrast">
      {children}
    </div>
  </div>
);
const Amount = ({ value }: { value?: number }) =>
  value != null && Number.isFinite(value) ? (
    <Text.numeral dp={8} suffix=" USDC">
      {value}
    </Text.numeral>
  ) : (
    <>--</>
  );

export function SettlementSegments({
  records,
  conflict,
  conflictedRecordKeys,
}: {
  records: readonly BinaryHistoryRecord[];
  conflict: boolean;
  conflictedRecordKeys?: readonly string[];
}) {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  return (
    <div className="oui-space-y-3">
      {records.map((record) => {
        const segmentConflict =
          conflictedRecordKeys?.includes(record.recordKey) ?? conflict;
        const completed = isBinarySettlementComplete(record, segmentConflict);
        return (
          <div
            key={record.recordKey}
            className="oui-space-y-2 oui-rounded-lg oui-border oui-border-line-12 oui-p-3"
          >
            <DetailRow
              label={record.outcome ? t(`prediction.${record.outcome}`) : "--"}
            >
              {t(
                completed
                  ? "prediction.resolution.segmentComplete"
                  : record.state === "pending" || record.state === "unknown"
                    ? "prediction.resolution.fundsProcessing"
                    : "prediction.resolution.dataIncomplete",
              )}
            </DetailRow>
            <DetailRow label={t("positions.history.column.netPnl")}>
              <Amount value={completed ? record.pnl : undefined} />
            </DetailRow>
            <DetailRow label={t("prediction.settledTime")}>
              {completed ? formatTableTime(record.completedAt!) : "--"}
            </DetailRow>
          </div>
        );
      })}
    </div>
  );
}

export function BinarySettlementDetailsUI({
  symbol,
  records,
  conflict,
  conflictedRecordKeys,
  loading,
  failed,
}: {
  symbol?: string;
  records: readonly BinaryHistoryRecord[];
  conflict: boolean;
  conflictedRecordKeys?: readonly string[];
  loading: boolean;
  failed: boolean;
}) {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  return (
    <div className="oui-max-h-[70vh] oui-space-y-3 oui-overflow-y-auto oui-p-4">
      <p className="oui-text-xs oui-break-all oui-text-base-contrast-54">
        {symbol}
      </p>
      {loading && (
        <p role="status">{t("prediction.resolution.historyLoading")}</p>
      )}
      {failed && (
        <p role="status">{t("prediction.resolution.historyUnavailable")}</p>
      )}
      {records.map((record) => {
        const segmentConflict =
          conflictedRecordKeys?.includes(record.recordKey) ?? conflict;
        const completed = isBinarySettlementComplete(record, segmentConflict);
        return (
          <div
            key={record.recordKey}
            className="oui-space-y-3 oui-rounded-lg oui-border oui-border-line-12 oui-p-3"
          >
            <DetailRow
              label={record.outcome ? t(`prediction.${record.outcome}`) : "--"}
            >
              {t(
                completed
                  ? "prediction.resolution.segmentComplete"
                  : record.state === "pending" || record.state === "unknown"
                    ? "prediction.resolution.fundsProcessing"
                    : "prediction.resolution.dataIncomplete",
              )}
            </DetailRow>
            <DetailRow label={t("common.time")}>
              {record.openedAt != null
                ? formatTableTime(record.openedAt)
                : "--"}
            </DetailRow>
            <DetailRow label={t("common.quantity")}>
              {record.quantity != null &&
              record.issues.length === 0 &&
              !segmentConflict ? (
                <Text.numeral dp={4}>{record.quantity}</Text.numeral>
              ) : (
                "--"
              )}
            </DetailRow>
            <DetailRow label={t("prediction.resolution.investment")}>
              <Amount value={completed ? record.investment : undefined} />
            </DetailRow>
            <DetailRow label={t("positions.history.netPnl.tradingFee")}>
              <Amount value={completed ? record.tradingFee : undefined} />
            </DetailRow>
            <DetailRow label={t("prediction.payout")}>
              <Amount value={completed ? record.payout : undefined} />
            </DetailRow>
            <DetailRow label={t("positions.history.column.netPnl")}>
              <Amount value={completed ? record.pnl : undefined} />
            </DetailRow>
            <DetailRow label={t("prediction.settledTime")}>
              {completed ? formatTableTime(record.completedAt!) : "--"}
            </DetailRow>
          </div>
        );
      })}
    </div>
  );
}

export function BinaryPriceEvidenceUI({ row }: { row?: BinaryInfoDetail }) {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  const evidence = hasBinaryPriceEvidence(row)
    ? row?.price_evidence
    : undefined;
  return (
    <div className="oui-space-y-4 oui-p-4">
      <DetailRow label={t("common.symbol")}>{row?.symbol ?? "--"}</DetailRow>
      <DetailRow label={t("prediction.resolution.indexSymbol")}>
        {row?.index_price_symbol ?? "--"}
      </DetailRow>
      {!evidence ? (
        <p role="status" className="oui-text-sm oui-text-base-contrast-54">
          {t("prediction.resolution.evidenceUnavailable")}
        </p>
      ) : (
        (
          [
            ["s0", "prediction.openingPrice"],
            ["s1", "prediction.finalPrice"],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className="oui-space-y-3 oui-rounded-lg oui-border oui-border-line-12 oui-p-3"
          >
            <DetailRow label={t(label)}>
              <Text.numeral dp={8} prefix="$">
                {evidence[key].price}
              </Text.numeral>
            </DetailRow>
            <DetailRow label={t("common.time")}>
              {formatTableTime(evidence[key].timestamp)} (
              {evidence[key].timestamp})
            </DetailRow>
            <DetailRow label={t("prediction.resolution.source")}>
              {evidence[key].source}
            </DetailRow>
          </div>
        ))
      )}
    </div>
  );
}

export function RoundResultUI(
  props: RoundResultState & { marketName: string; intervalSeconds: number },
) {
  const { t } = useTranslation();
  const { formatRoundWindow } = usePredictionFormatters();
  const { row, outcome } = props;
  return (
    <section className="oui-prediction-roundResult oui-space-y-4 oui-rounded-xl oui-bg-base-9 oui-p-4">
      <h2
        className={cn(
          "oui-text-center oui-text-lg oui-font-semibold",
          outcome === "up" ? "oui-text-trade-profit" : "oui-text-trade-loss",
        )}
      >
        {t("prediction.resolution.outcome", {
          outcome: outcome ? t(`prediction.${outcome}`) : "--",
        })}
      </h2>
      <p className="oui-text-xs oui-text-center oui-font-normal oui-text-base-contrast-54">
        {props.marketName} ·{" "}
        {formatRoundWindow(
          (row?.observation_start_at ?? 0) / 1000,
          props.intervalSeconds,
          row?.expire_at,
        )}
      </p>
      <DetailRow label={t("common.symbol")}>{row?.symbol ?? "--"}</DetailRow>
      <DetailRow label={t("prediction.openingPrice")}>
        <Text.numeral dp={8} prefix="$">
          {row?.s0 ?? "--"}
        </Text.numeral>
      </DetailRow>
      <DetailRow label={t("prediction.finalPrice")}>
        <Text.numeral dp={8} prefix="$">
          {row?.s1 ?? "--"}
        </Text.numeral>
      </DetailRow>
      {props.historyLoading && (
        <p role="status" className="oui-text-xs oui-text-base-contrast-54">
          {t("prediction.resolution.historyLoading")}
        </p>
      )}
      {props.historyFailed && (
        <p role="status" className="oui-text-xs oui-text-base-contrast-54">
          {t("prediction.resolution.historyUnavailable")}
        </p>
      )}
      {props.status && (
        <p role="status" className="oui-text-xs oui-text-base-contrast-54">
          {t(
            props.status === "processing"
              ? "prediction.resolution.fundsProcessing"
              : "prediction.resolution.dataIncomplete",
          )}
        </p>
      )}
      {props.status && props.records.length === 0 && (
        <div className="oui-space-y-2">
          <DetailRow label={t("positions.history.column.netPnl")}>--</DetailRow>
          <DetailRow label={t("prediction.settledTime")}>--</DetailRow>
        </div>
      )}
      <SettlementSegments
        records={props.records}
        conflict={props.conflict}
        conflictedRecordKeys={props.conflictedRecordKeys}
      />
      <div className="oui-flex oui-flex-wrap oui-gap-2">
        <Button size="sm" variant="outlined" onClick={props.showEvidence}>
          {t("prediction.resolution.priceEvidence")}
        </Button>
        {props.records.length > 0 && (
          <Button size="sm" variant="outlined" onClick={props.showSettlement}>
            {t("prediction.resolution.settlementDetails")}
          </Button>
        )}
      </div>
      {!props.evidenceAvailable && (
        <div className="oui-text-xs oui-flex oui-items-center oui-justify-between oui-gap-2 oui-font-normal oui-text-base-contrast-54">
          <span>{t("prediction.resolution.evidenceUnavailable")}</span>
          {props.evidenceFailed && (
            <Button
              size="sm"
              variant="text"
              disabled={props.evidenceLoading}
              onClick={props.retryEvidence}
            >
              {t("prediction.resolution.retry")}
            </Button>
          )}
        </div>
      )}
      <Button
        fullWidth
        size="md"
        disabled={!props.nextRoundAvailable}
        onClick={props.goToNextRound}
      >
        {t("prediction.resolution.nextRound")}
      </Button>
    </section>
  );
}
