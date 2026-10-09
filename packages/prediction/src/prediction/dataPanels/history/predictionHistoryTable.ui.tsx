import { useTranslation } from "@orderly.network/i18n";
import { Text } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import { binaryHistoryDisplayRows } from "../../binary/binarySettlement";
import { OutcomeBadge, RoundSymbol, TableNumber } from "../../cells";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { usePredictionFormatters } from "../../predictionShared";
import { PredictionFilters } from "../filters/predictionFilters.ui";
import { PredictionDataTable, tableColumn } from "../table";
import type { PredictionHistoryTableScript } from "./predictionHistoryTable.script";

/* eslint-disable react/jsx-key -- DataTable cells are positional arrays keyed by their parent row. */
export type PredictionHistoryTableUIProps = {
  state: PredictionAccountPanelState;
  filters: PredictionHistoryTableScript["filters"];
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
};

export const PredictionHistoryTableUI = ({
  state,
  filters,
  leadingFilterItems,
  onLeadingFilter,
}: PredictionHistoryTableUIProps) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  return (
    <PredictionDataTable
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
      rows={binaryHistoryDisplayRows(state.historyRecords)
        .filter((record) =>
          filters.matches({
            outcome: record.outcome ?? "",
            status: record.result === "closed" ? "closed" : "settled",
            timestamp: record.filterTime,
          }),
        )
        .map((record) => ({
          id: record.recordKey,
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
            record.outcome ? (
              <RoundSymbol
                round={record.round}
                outcome={record.outcome}
                symbol={record.symbol}
              />
            ) : (
              <Text>{record.symbol}</Text>
            ),
            record.outcome ? (
              <OutcomeBadge outcome={record.outcome} />
            ) : (
              <Text intensity={36}>--</Text>
            ),
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
            ) : record.result ? (
              <OutcomeBadge outcome={record.result} />
            ) : (
              <Text intensity={36}>--</Text>
            ),
            // Final PnL/time only once the system close finished
            // (api-spec §6.3); pending expiry rows show placeholders.
            record.pnl != null ? (
              <Text.pnl dp={2} coloring>
                {record.pnl}
              </Text.pnl>
            ) : (
              <Text intensity={36}>--</Text>
            ),
            record.settledAt != null ? (
              formatTableTime(record.settledAt)
            ) : (
              <Text intensity={36}>--</Text>
            ),
          ],
        }))}
    />
  );
};
/* eslint-enable react/jsx-key */
