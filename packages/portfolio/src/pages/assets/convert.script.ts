import React, { useMemo, useState } from "react";
import { subDays } from "date-fns";
import {
  useAccount,
  useCollateral,
  useIndexPricesStream,
  useSubAccountQuery,
  useQuery,
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

export const useConvertScript = () => {
  const { t } = useTranslation();
  const { isMainAccount, state } = useAccount();
  const { holding = [] } = useCollateral();
  const { data: indexPrices } = useIndexPricesStream();

  const { data: chainsInfo } = useQuery("/v1/public/chain_info", {
    revalidateOnFocus: false,
  });

  // Pagination
  const { page, pageSize, setPage, parsePagination } = usePagination({
    page: 1,
    pageSize: 20,
  });

  // Use the same account data structure as assets
  const allAccounts = useAccountsData();

  // Use the same account filter logic as assets
  const { selectedAccount, onAccountFilter } =
    useAssetsAccountFilter(allAccounts);

  // console.log("holding", selectedAccount);

  // Date range filter (default to last 90 days)
  const defaultRange = formatDatePickerRange({
    to: offsetEndOfDay(new Date()),
    from: offsetStartOfDay(subDays(new Date(), 89)),
  });

  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>(defaultRange);

  // Filter states (matching API fields)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [convertedAssetFilter, setConvertedAssetFilter] =
    useState<string>("all");

  // Create asset options from holding data - similar to assets script
  const convertedAssetOptions = useMemo(() => {
    if (!Array.isArray(holding) || holding.length === 0) {
      return [{ label: "All assets", value: "all" }];
    }

    // Extract unique tokens from holding data
    const uniqueTokens = [
      ...new Set(
        holding
          .filter((item) => item.token && item.token !== "USDC") // Exclude USDC as it's the received asset
          .map((item) => item.token),
      ),
    ];

    // Create options array
    const assetOptions = uniqueTokens.map((token) => ({
      value: token,
      label: token,
    }));

    return [{ label: "All assets", value: "all" }, ...assetOptions];
  }, [holding]);

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
      } else if (name === "converted_asset") {
        setConvertedAssetFilter(value as string);
        setPage(1);
      } else if (name === "time" || name === "dateRange") {
        const dateRangeValue = formatDatePickerRange(
          value as { from: Date; to: Date },
        );
        setDateRange(dateRangeValue);
        setPage(1);
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

    if (convertedAssetFilter !== "all") {
      params.set("converted_asset", convertedAssetFilter);
    }

    return `/v1/asset/convert_history?${params.toString()}`;
  }, [page, pageSize, dateRange, statusFilter, convertedAssetFilter]);

  // Query convert history with all parameters
  const { data, isLoading, ...res } = useSubAccountQuery<{
    rows: ConvertRecord[];
    meta: {
      total: number;
      current_page: number;
      records_per_page: number;
    };
  }>(queryUrl, {
    accountId: isMainAccount ? state.mainAccountId : state.accountId,
    formatter: (data) => {
      return data;
    },
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
  const mockData: ConvertRecord[] = [
    {
      convert_id: 1001,
      converted_asset: {
        BTC: 0.5,
        ETH: 2.5,
      },
      received_asset: "USDC",
      received_qty: 85420.5,
      type: "manual",
      status: "completed",
      created_time: Date.now() - 86400000, // 1 day ago
      updated_time: Date.now() - 86300000,
      details: [
        {
          transaction_id: 10001,
          venue: "internal_fund",
          converted_asset: "BTC",
          received_asset: "USDC",
          converted_qty: 0.5,
          received_qty: 42500.0,
          haircut: 212.5,
        },
        {
          transaction_id: 10002,
          venue: "on_chain",
          converted_asset: "ETH",
          received_asset: "USDC",
          converted_qty: 2.5,
          received_qty: 42920.5,
          haircut: 107.3,
          chain_id: 1,
          tx_id: "0x1234567890abcdef1234567890abcdef12345678",
        },
      ],
    },
    {
      convert_id: 1002,
      converted_asset: {
        NEAR: 1000.0,
      },
      received_asset: "USDC",
      received_qty: 3240.75,
      type: "auto",
      status: "pending",
      created_time: Date.now() - 3600000, // 1 hour ago
      updated_time: Date.now() - 3600000,
      details: [
        {
          transaction_id: 10003,
          venue: "on_chain",
          converted_asset: "NEAR",
          received_asset: "USDC",
          converted_qty: 1000.0,
          received_qty: 3240.75,
          haircut: 16.2,
          chain_id: 397,
          tx_id: "0xabcdef1234567890abcdef1234567890abcdef12",
        },
      ],
    },
    {
      convert_id: 1003,
      converted_asset: {
        SOL: 15.0,
        WOO: 500.0,
      },
      received_asset: "USDC",
      received_qty: 2890.45,
      type: "manual",
      status: "failed",
      created_time: Date.now() - 172800000, // 2 days ago
      updated_time: Date.now() - 172700000,
      details: [
        {
          transaction_id: 10004,
          venue: "internal_fund",
          converted_asset: "SOL",
          received_asset: "USDC",
          converted_qty: 15.0,
          received_qty: 2250.0,
          haircut: 11.25,
        },
        {
          transaction_id: 10005,
          venue: "internal_fund",
          converted_asset: "WOO",
          received_asset: "USDC",
          converted_qty: 500.0,
          received_qty: 640.45,
          haircut: 3.2,
        },
      ],
    },
    {
      convert_id: 1004,
      converted_asset: {
        ARB: 800.0,
      },
      received_asset: "USDC",
      received_qty: 1456.32,
      type: "auto",
      status: "completed",
      created_time: Date.now() - 259200000, // 3 days ago
      updated_time: Date.now() - 259100000,
      details: [
        {
          transaction_id: 10006,
          venue: "on_chain",
          converted_asset: "ARB",
          received_asset: "USDC",
          converted_qty: 800.0,
          received_qty: 1456.32,
          haircut: 7.28,
          chain_id: 42161,
          tx_id: "0xfedcba0987654321fedcba0987654321fedcba09",
        },
      ],
    },
    {
      convert_id: 1005,
      converted_asset: {
        MATIC: 2000.0,
        AVAX: 50.0,
        LINK: 100.0,
        UNI: 150.0,
        AAVE: 25.0,
      },
      received_asset: "USDC",
      received_qty: 3845.2,
      type: "manual",
      status: "cancelled",
      created_time: Date.now() - 432000000, // 5 days ago
      updated_time: Date.now() - 431900000,
      details: [
        {
          transaction_id: 10007,
          venue: "on_chain",
          converted_asset: "MATIC",
          received_asset: "USDC",
          converted_qty: 2000.0,
          received_qty: 1680.0,
          haircut: 8.4,
          chain_id: 137,
          tx_id: "0x9876543210fedcba9876543210fedcba98765432",
        },
        {
          transaction_id: 10008,
          venue: "internal_fund",
          converted_asset: "AVAX",
          received_asset: "USDC",
          converted_qty: 50.0,
          received_qty: 2165.2,
          haircut: 10.83,
        },
      ],
    },
    {
      convert_id: 1006,
      converted_asset: {
        OP: 1200.0,
      },
      received_asset: "USDC",
      received_qty: 2134.8,
      type: "auto",
      status: "completed",
      created_time: Date.now() - 604800000, // 7 days ago
      updated_time: Date.now() - 604700000,
      details: [
        {
          transaction_id: 10009,
          venue: "on_chain",
          converted_asset: "OP",
          received_asset: "USDC",
          converted_qty: 1200.0,
          received_qty: 2134.8,
          haircut: 10.67,
          chain_id: 10,
          tx_id: "0x1122334455667788990011223344556677889900",
        },
      ],
    },
    {
      convert_id: 1007,
      converted_asset: {
        LINK: 100.0,
        UNI: 150.0,
        AAVE: 25.0,
      },
      received_asset: "USDC",
      received_qty: 4567.89,
      type: "manual",
      status: "pending",
      created_time: Date.now() - 1800000, // 30 minutes ago
      updated_time: Date.now() - 1800000,
      details: [
        {
          transaction_id: 10010,
          venue: "internal_fund",
          converted_asset: "LINK",
          received_asset: "USDC",
          converted_qty: 100.0,
          received_qty: 1456.0,
          haircut: 7.28,
        },
        {
          transaction_id: 10011,
          venue: "internal_fund",
          converted_asset: "UNI",
          received_asset: "USDC",
          converted_qty: 150.0,
          received_qty: 1234.5,
          haircut: 6.17,
        },
        {
          transaction_id: 10012,
          venue: "on_chain",
          converted_asset: "AAVE",
          received_asset: "USDC",
          converted_qty: 25.0,
          received_qty: 1877.39,
          haircut: 9.39,
          chain_id: 1,
          tx_id: "0xaabbccddeefffaaabbccddeeffaabbccddeeff",
        },
      ],
    },
    {
      convert_id: 1008,
      converted_asset: {
        DOT: 200.0,
      },
      received_asset: "USDC",
      received_qty: 1234.56,
      type: "auto",
      status: "completed",
      created_time: Date.now() - 1209600000, // 14 days ago
      updated_time: Date.now() - 1209500000,
      details: [
        {
          transaction_id: 10013,
          venue: "internal_fund",
          converted_asset: "DOT",
          received_asset: "USDC",
          converted_qty: 200.0,
          received_qty: 1234.56,
          haircut: 6.17,
        },
      ],
    },
  ];

  // Use real data if available, otherwise use mock data for development
  const dataSource = data?.rows || [];

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
    dataSource: data?.rows || [],
    summary,
    pagination,

    // Filter state and handlers (compatible with assets)
    selectedAccount,
    onFilter,

    // Date range state
    dateRange,

    // Filter states
    statusFilter,
    convertedAssetFilter,
    convertedAssetOptions,

    // Actions
    onConvert: handleConvert,
    onRefresh: handleRefresh,
    onDetailsClick: handleDetailsClick,

    // State
    isMainAccount,
    isLoading,
    holding,

    // Index prices
    indexPrices,
    chainsInfo,
  };
};

export type UseConvertScriptReturn = ReturnType<typeof useConvertScript>;
