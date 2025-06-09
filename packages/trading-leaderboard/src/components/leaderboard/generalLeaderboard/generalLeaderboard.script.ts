import { useCallback, useMemo, useState } from "react";
import { differenceInDays } from "date-fns";
import { DateRange } from "../../../type";
import { formatDateRange, getDateRange } from "../../../utils";
import { TradingTab } from "../shared/LeaderboardTabs";

export type GeneralLeaderboardScriptReturn = ReturnType<
  typeof useGeneralLeaderboardScript
>;

export type GeneralLeaderboardScriptOptions = {};

export const FilterDays = [7, 14, 30, 90] as const;
export type TFilterDays = (typeof FilterDays)[number];

export function useGeneralLeaderboardScript(
  options?: GeneralLeaderboardScriptOptions,
) {
  const [activeTab, setActiveTab] = useState<TradingTab>(TradingTab.Volume);
  const filterState = useFilter();
  const searchState = useSearch();

  return {
    ...filterState,
    ...searchState,
    activeTab,
    onTabChange: setActiveTab,
  };
}

function useFilter() {
  // default is 90d
  const [filterDay, setFilterDay] = useState<TFilterDays | null>(90);

  const [dateRange, setDateRange] = useState<DateRange>(getDateRange(90));

  const updateFilterDay = (day: TFilterDays) => {
    setFilterDay(day);
    setDateRange(getDateRange(day));
  };

  const onFilter = (filter: { name: string; value: any }) => {
    if (filter.name === "dateRange") {
      const newDateRange = filter.value;
      setDateRange(newDateRange);

      if (newDateRange.from && newDateRange.to) {
        const offsetDay =
          Math.abs(differenceInDays(newDateRange.from, newDateRange.to)) + 1;

        const dateRange = getDateRange(offsetDay);
        if (
          formatDateRange(dateRange.from) ===
            formatDateRange(newDateRange.from) &&
          formatDateRange(dateRange.to) === formatDateRange(newDateRange.to)
        ) {
          setFilterDay(offsetDay as any);
        } else {
          setFilterDay(null);
        }
      }
    }
  };

  const filterItems = useMemo(() => {
    const dateRangeFilter = {
      type: "range",
      name: "dateRange",
      value: dateRange,
      max: 90,
    };

    return [dateRangeFilter] as any;
  }, [dateRange]);

  return {
    filterItems,
    onFilter,
    dateRange,
    filterDay,
    updateFilterDay,
  };
}

function useSearch() {
  const [searchValue, setSearchValue] = useState("");
  const onSearchValueChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const clearSearchValue = useCallback(() => {
    setSearchValue("");
  }, []);

  return {
    searchValue,
    onSearchValueChange,
    clearSearchValue,
  };
}
