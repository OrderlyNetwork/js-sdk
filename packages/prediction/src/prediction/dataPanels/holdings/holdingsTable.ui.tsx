import { useTranslation } from "@orderly.network/i18n";
import { Text } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import {
  OutcomeBadge,
  PredictionPnl,
  RoundCountdown,
  RoundSymbol,
  TableNumber,
} from "../../cells";
import { SellPosition } from "../../orderEntry/sellPosition";
import type {
  PredictionAccountPanelState,
  PredictionPosition,
} from "../../prediction.types";
import { PredictionFilters } from "../filters/predictionFilters.ui";
import { PredictionDataTable, tableColumn } from "../table";
import type { HoldingsTableScript } from "./holdingsTable.script";
import { useHoldingsPositionRows } from "./holdingsTable.script";

/* eslint-disable react/jsx-key -- DataTable cells are positional arrays keyed by their parent row. */
export type HoldingsTableUIProps = {
  state: PredictionAccountPanelState;
  filters: HoldingsTableScript["filters"];
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
  getPositionState?: (
    position: PredictionPosition,
  ) => PredictionAccountPanelState;
  groups?: Array<{ id: string; label: React.ReactNode }>;
  onSubmitted?: () => Promise<unknown>;
  loading?: boolean;
};

export const HoldingsTableUI = ({
  state,
  filters,
  leadingFilterItems,
  onLeadingFilter,
  getPositionState,
  groups,
  onSubmitted,
  loading,
}: HoldingsTableUIProps) => {
  const { t } = useTranslation();
  const rows = useHoldingsPositionRows(
    state,
    filters.matches,
    getPositionState,
  );
  return (
    <PredictionDataTable
      groups={groups}
      loading={loading}
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
      rows={rows.map(
        ({ id, position, lastPrice, uPnL, availableQuantity, roundInfo }) => ({
          id,
          groupId: position.accountId,
          sortValues: [
            undefined,
            undefined,
            position.quantity,
            availableQuantity,
            position.averagePrice,
            lastPrice,
            uPnL,
          ],
          cells: [
            <RoundSymbol
              round={position.round ?? state.marketView?.round ?? 0}
              outcome={position.outcome}
              symbol={position.symbol}
              onSelectRoundSymbol={state.onSelectRoundSymbol}
            />,
            <OutcomeBadge outcome={position.outcome} />,
            <TableNumber value={position.quantity} />,
            <TableNumber value={availableQuantity} />,
            <TableNumber value={position.averagePrice} />,
            lastPrice != null ? (
              <TableNumber value={lastPrice} />
            ) : (
              <Text intensity={36}>--</Text>
            ),
            uPnL != null ? (
              <PredictionPnl value={uPnL} />
            ) : (
              <Text intensity={36}>--</Text>
            ),
            <RoundCountdown roundInfo={roundInfo} />,
            <SellPosition
              state={getPositionState?.(position) ?? state}
              accountId={position.accountId}
              onSubmitted={onSubmitted}
              outcome={position.outcome}
              symbol={position.symbol}
            />,
          ],
        }),
      )}
    />
  );
};
/* eslint-enable react/jsx-key */
