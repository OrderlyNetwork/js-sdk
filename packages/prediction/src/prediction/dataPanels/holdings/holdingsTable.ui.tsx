import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Text } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OutcomeBadge, RoundSymbol, TableNumber } from "../../cells";
import { SellPosition } from "../../orderEntry/sellPosition";
import type { PredictionState } from "../../prediction.script";
import { formatCountdown } from "../../predictionShared";
import { PredictionFilters } from "../filters/predictionFilters.ui";
import { PredictionDataTable, tableColumn } from "../table";
import type { HoldingsTableScript } from "./holdingsTable.script";

/* eslint-disable react/jsx-key -- DataTable cells are positional arrays keyed by their parent row. */
export type HoldingsTableUIProps = {
  state: PredictionState;
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
            : t(`prediction.phase.${state.roundPhase}`),
          <SellPosition state={state} outcome={position.outcome} />,
        ],
      }))}
    />
  );
};
/* eslint-enable react/jsx-key */
