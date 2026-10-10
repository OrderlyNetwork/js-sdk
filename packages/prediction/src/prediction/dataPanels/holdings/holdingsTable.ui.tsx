import { useTranslation } from "@orderly.network/i18n";
import { Text } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import { OutcomeBadge, RoundSymbol, TableNumber } from "../../cells";
import { useRoundCountdown } from "../../hooks/useRoundCountdown";
import { SellPosition } from "../../orderEntry/sellPosition";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { formatCountdown } from "../../predictionShared";
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
};

export const HoldingsTableUI = ({
  state,
  filters,
  leadingFilterItems,
  onLeadingFilter,
}: HoldingsTableUIProps) => {
  const { t } = useTranslation();
  const countdown = useRoundCountdown(state.marketView?.selectedRow?.expire_at);
  const rows = useHoldingsPositionRows(state, filters.matches);
  return (
    <PredictionDataTable
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
        ({
          id,
          position,
          isSelectedRound,
          lastPrice,
          uPnL,
          availableQuantity,
        }) => ({
          id,
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
              <Text.pnl dp={2} coloring>
                {uPnL}
              </Text.pnl>
            ) : (
              <Text intensity={36}>--</Text>
            ),
            isSelectedRound
              ? state.marketView?.isRoundTradable
                ? formatCountdown(countdown)
                : t(
                    `prediction.phase.${state.marketView?.roundPhase ?? "closed"}`,
                  )
              : "--",
            <SellPosition
              state={state}
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
