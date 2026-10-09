import { useState } from "react";

export const predictionDateRange = (days: number) => {
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return { from, to };
};

export const usePredictionFilters = (withDate = false) => {
  const [side, setSide] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [status, setStatus] = useState("all");
  const [days, setDays] = useState<number | null>(90);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(() =>
    predictionDateRange(90),
  );
  const updateDays = (value: number) => {
    setDays(value);
    setDateRange(predictionDateRange(value));
  };
  const onFilter = ({ name, value }: { name: string; value: unknown }) => {
    if (name === "side" && typeof value === "string") setSide(value);
    if (name === "outcome" && typeof value === "string") setOutcome(value);
    if (name === "status" && typeof value === "string") setStatus(value);
    if (name === "dateRange" && value !== null && typeof value === "object") {
      const range = value as { from?: Date | string; to?: Date | string };
      const from = range.from ? new Date(range.from) : undefined;
      const to = range.to ? new Date(range.to) : undefined;
      from?.setHours(0, 0, 0, 0);
      to?.setHours(23, 59, 59, 999);
      setDateRange({ from, to });
      setDays(null);
    }
  };
  const matches = (record: {
    outcome: string;
    side?: string;
    status?: string;
    timestamp?: number;
  }) =>
    (side === "all" || record.side === side) &&
    (outcome === "all" || record.outcome === outcome) &&
    (status === "all" || record.status === status) &&
    (!withDate ||
      (record.timestamp !== undefined &&
        (!dateRange.from || record.timestamp >= dateRange.from.getTime()) &&
        (!dateRange.to || record.timestamp <= dateRange.to.getTime())));
  return {
    side,
    outcome,
    status,
    days,
    dateRange,
    updateDays,
    onFilter,
    matches,
  };
};
