import type { ReactNode } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Text } from "@orderly.network/ui";
import type { BinaryHistoryRecord } from "../binary/binaryHistory";
import { isBinarySettlementComplete } from "../binary/binarySettlement";
import { RoundOrderStatusCard } from "../orderEntry/roundOrderStatusCard.ui";
import { outcomeLabels } from "../predictionLabels";
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

/** Status line + card skeleton for a settled position segment. */
const SegmentCard = ({
  record,
  segmentConflict,
  children,
}: {
  record: BinaryHistoryRecord;
  segmentConflict: boolean;
  children: (completed: boolean) => ReactNode;
}) => {
  const { t } = useTranslation();
  const completed = isBinarySettlementComplete(record, segmentConflict);
  return (
    <div className="oui-space-y-2 oui-rounded-lg oui-border oui-border-line-12 oui-p-3">
      <DetailRow
        label={record.outcome ? outcomeLabels()[record.outcome] : "--"}
      >
        {t(
          completed
            ? "prediction.resolution.segmentComplete"
            : record.state === "pending" || record.state === "unknown"
              ? "prediction.resolution.fundsProcessing"
              : "prediction.resolution.dataIncomplete",
        )}
      </DetailRow>
      {children(completed)}
    </div>
  );
};

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
      {records.map((record) => (
        <SegmentCard
          key={record.recordKey}
          record={record}
          segmentConflict={
            conflictedRecordKeys?.includes(record.recordKey) ?? conflict
          }
        >
          {(completed) => (
            <>
              <DetailRow label={t("positions.history.column.netPnl")}>
                <Amount value={completed ? record.pnl : undefined} />
              </DetailRow>
              <DetailRow label={t("prediction.settledTime")}>
                {completed ? formatTableTime(record.completedAt!) : "--"}
              </DetailRow>
            </>
          )}
        </SegmentCard>
      ))}
    </div>
  );
}

export function RoundResultUI(
  props: RoundResultState & { marketName: string; intervalSeconds: number },
) {
  return (
    <div className="oui-prediction-roundResult">
      <RoundOrderStatusCard
        marketName={props.marketName}
        intervalSeconds={props.intervalSeconds}
        round={(props.row?.observation_start_at ?? 0) / 1000}
        expireAt={props.row?.expire_at}
        roundPhase={props.outcome === "up" ? "resolvedUp" : "resolvedDown"}
        isRoundInSnapshot
      />
    </div>
  );
}
