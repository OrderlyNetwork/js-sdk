import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { DataFilter, Text } from "@orderly.network/ui";
import type { DataFilterItem } from "@orderly.network/ui";
import {
  usePredictionFilters,
  predictionDateRange,
} from "../../predictionFilters.script";

export const PredictionFilters = ({
  filters,
  mode,
  trailing,
  leadingItems = [],
  onLeadingFilter,
  onFilter,
  statusOptions,
}: {
  filters: ReturnType<typeof usePredictionFilters>;
  mode: "holdings" | "pending" | "filled" | "history" | "settlements";
  trailing?: React.ReactNode;
  leadingItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
  onFilter?: (filter: { name: string; value: unknown }) => void;
  statusOptions?: { label: string; value: string }[];
}) => {
  const { t } = useTranslation();
  const items: DataFilterItem[] = [];
  if (mode !== "holdings" && mode !== "settlements")
    items.push({
      type: "select",
      name: "side",
      value: filters.side,
      options: [
        { label: t("common.side.all"), value: "all" },
        { label: t("common.buy"), value: "buy" },
        { label: t("common.sell"), value: "sell" },
      ],
    });
  if (mode === "settlements")
    items.push({
      type: "select",
      name: "outcome",
      value: filters.outcome,
      options: [
        { label: t("prediction.filter.allOutcomes"), value: "all" },
        { label: t("prediction.up"), value: "up" },
        { label: t("prediction.down"), value: "down" },
        { label: t("prediction.tie"), value: "tie" },
      ],
    });
  if (mode === "history") {
    items.push({
      type: "select",
      name: "status",
      value: filters.status,
      options: statusOptions ?? [
        { label: t("common.status.all"), value: "all" },
        { label: t("orders.status.pending"), value: "pending" },
        { label: t("prediction.status.filled"), value: "filled" },
        { label: t("prediction.status.cancelled"), value: "cancelled" },
      ],
    });
  }
  if (mode === "history" || mode === "settlements") {
    items.push({
      type: "range",
      name: "dateRange",
      value: { from: filters.dateRange.from, to: filters.dateRange.to },
      fromDate: predictionDateRange(90).from,
      toDate: predictionDateRange(1).to,
    });
  }
  // DataFilter already applies py={3}; only keep horizontal inset here.
  return (
    <div className="oui-flex oui-flex-wrap oui-items-center oui-gap-3 oui-px-2">
      <DataFilter
        className="oui-w-auto oui-flex-wrap oui-gap-y-3"
        items={[...leadingItems, ...items]}
        onFilter={(filter) => {
          if (leadingItems.some((item) => item.name === filter.name)) {
            onLeadingFilter?.(filter);
            return;
          }
          filters.onFilter(filter);
          onFilter?.(filter);
        }}
      />
      {mode === "settlements" &&
        [1, 7, 30, 90].map((days) => (
          <button
            key={days}
            type="button"
            aria-pressed={filters.days === days}
            onClick={() => filters.updateDays(days)}
            className="oui-text-sm oui-relative oui-rounded oui-px-2 oui-py-[2px]"
          >
            <span className="oui-pointer-events-none oui-absolute oui-inset-0 oui-rounded oui-opacity-[.12] oui-gradient-primary" />
            <Text.gradient
              color={filters.days === days ? "brand" : undefined}
              className={
                filters.days !== days ? "oui-text-base-contrast-54" : undefined
              }
            >
              {days}D
            </Text.gradient>
          </button>
        ))}
      {trailing && <div className="oui-ml-auto">{trailing}</div>}
    </div>
  );
};
