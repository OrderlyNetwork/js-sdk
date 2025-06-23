import React, { useMemo, useState } from "react";
import {
  differenceInDays,
  subDays,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns";
import {
  useAccount,
  useCollateral,
  useSubAccountQuery,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { usePagination } from "@orderly.network/ui";
import { useAccountsData } from "../../hooks/useAccountsData";
import { useAssetsAccountFilter } from "../../hooks/useAssetsAccountFilter";
import { ConvertRecord } from "./type";

// Utility functions for date handling
const offsetStartOfDay = (date?: Date) => {
  if (date == null) return date;
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const offsetEndOfDay = (date?: Date) => {
  if (date == null) return date;
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const formatDatePickerRange = (range: { from?: Date; to?: Date }) => {
  return {
    from: offsetStartOfDay(range.from),
    to: offsetEndOfDay(range.to),
  };
};

const areDatesEqual = (date1?: Date, date2?: Date) => {
  if (!date1 || !date2) return false;
  return date1.getTime() === date2.getTime();
};

export const useConvertScript = () => {
  const { t } = useTranslation();
  const { isMainAccount, state } = useAccount();

  // Pagination
  const { page, pageSize, setPage, parsePagination } = usePagination({
    page: 1,
    pageSize: 20,
  });

  // Use the same account data structure as assets
  const allAccounts = useAccountsData();

  // Use the same account filter logic as assets
  const { selectedAccount, filteredData, onAccountFilter } =
    useAssetsAccountFilter(allAccounts);

  // Date range filter (default to last 90 days)
  const defaultRange = formatDatePickerRange({
    to: offsetEndOfDay(new Date()),
    from: offsetStartOfDay(subDays(new Date(), 89)),
  });

  const [filterDays, setFilterDays] = useState<1 | 7 | 30 | 90 | null>(90);
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>(defaultRange);

  // Filter states (matching API fields)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [convertedAssetFilter, setConvertedAssetFilter] =
    useState<string>("all");

  // Update filter days helper
  const updateFilterDays = React.useCallback((days: 1 | 7 | 30 | 90) => {
    setFilterDays(days);
    setDateRange({
      from: offsetStartOfDay(subDays(new Date(), days - 1)),
      to: offsetEndOfDay(new Date()),
    });
  }, []);

  // Handle all filters (including account filter and date range)
  const onFilter = React.useCallback(
    (filter: { name: string; value: string | { from: Date; to: Date } }) => {
      const { name, value } = filter;

      // Delegate account filter to the hook
      if (name === "account") {
        onAccountFilter(filter as { name: string; value: string });
      } else if (name === "status") {
        setStatusFilter(value as string);
        setPage(1); // Reset to first page when filter changes
      } else if (name === "type") {
        setTypeFilter(value as string);
        setPage(1);
      } else if (name === "converted_asset") {
        setConvertedAssetFilter(value as string);
        setPage(1);
      } else if (name === "time" || name === "dateRange") {
        const dateRangeValue = formatDatePickerRange(
          value as { from: Date; to: Date },
        );
        setDateRange(dateRangeValue);
        setPage(1);

        // Check if it matches any predefined range
        const now = new Date();
        const dayOptions = [1, 7, 30, 90] as const;
        let matchedDays: 1 | 7 | 30 | 90 | null = null;

        for (const days of dayOptions) {
          const expectedFrom = offsetStartOfDay(subDays(now, days - 1));
          const expectedTo = offsetEndOfDay(now);

          if (
            areDatesEqual(dateRangeValue.from, expectedFrom) &&
            areDatesEqual(dateRangeValue.to, expectedTo)
          ) {
            matchedDays = days;
            break;
          }
        }

        setFilterDays(matchedDays);
      }
    },
    [onAccountFilter, setPage],
  );

  // Build query URL with parameters
  const queryUrl = React.useMemo(() => {
    const params = new URLSearchParams();

    // Add pagination parameters
    params.set("page", page.toString());
    params.set("size", pageSize.toString());

    // Add date range parameters
    if (dateRange.from) {
      params.set("start_t", dateRange.from.getTime().toString());
    }
    if (dateRange.to) {
      params.set("end_t", dateRange.to.getTime().toString());
    }

    // Add filter parameters (only if not "all")
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }
    if (typeFilter !== "all") {
      params.set("type", typeFilter);
    }
    if (convertedAssetFilter !== "all") {
      params.set("converted_asset", convertedAssetFilter);
    }

    return `/v1/asset/convert_history?${params.toString()}`;
  }, [
    page,
    pageSize,
    dateRange,
    statusFilter,
    typeFilter,
    convertedAssetFilter,
  ]);

  // Query convert history with all parameters
  const { data, isLoading } = useSubAccountQuery<{
    data: ConvertRecord[];
    meta: {
      total: number;
      current_page: number;
      records_per_page: number;
    };
  }>(queryUrl, {
    accountId: isMainAccount ? state.mainAccountId : state.accountId,
  });

  // Parse pagination from API response meta
  const pagination = useMemo(() => {
    if (data?.meta) {
      return parsePagination(data.meta);
    }
    return {
      page,
      pageSize,
      onPageChange: setPage,
      onPageSizeChange: (size: number) => {
        // Handle page size change if needed
      },
    };
  }, [data?.meta, parsePagination, page, pageSize, setPage]);

  // Mock data for development (replace with actual data when API is ready)
  const mockData: ConvertRecord[] = [];

  // Use real data if available, otherwise use mock data
  const dataSource = data?.data || mockData;

  // Calculate summary
  const summary = useMemo(() => {
    const totalConversions = dataSource.length;
    const totalUSDCReceived = dataSource.reduce(
      (sum, record) => sum + record.received_qty,
      0,
    );
    const totalFees = dataSource.reduce(
      (sum, record) =>
        sum +
        record.details.reduce(
          (detailSum, detail) => detailSum + detail.haircut,
          0,
        ),
      0,
    );

    return {
      totalConversions,
      totalUSDCReceived,
      totalFees,
    };
  }, [dataSource]);

  // Action handlers
  const handleConvert = React.useCallback(() => {
    // Implement convert action
    console.log("Open convert modal");
  }, []);

  const handleRefresh = React.useCallback(() => {
    // Implement refresh action
    console.log("Refresh data");
  }, []);

  const handleDetailsClick = React.useCallback((convertId: number) => {
    // Implement details view
    console.log("Show details for convert ID:", convertId);
  }, []);

  return {
    // Data
    dataSource,
    summary,
    pagination,

    // Filter state and handlers (compatible with assets)
    selectedAccount,
    onFilter,

    // Date range state
    dateRange,
    filterDays,
    updateFilterDays,

    // Filter states
    statusFilter,
    typeFilter,
    convertedAssetFilter,

    // Actions
    onConvert: handleConvert,
    onRefresh: handleRefresh,
    onDetailsClick: handleDetailsClick,

    // State
    isMainAccount,
    isLoading,
  };
};

export type UseConvertScriptReturn = ReturnType<typeof useConvertScript>;
