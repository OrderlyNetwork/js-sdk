import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useMarkets,
  MarketsType,
  useMarginModes,
} from "@orderly.network/hooks";
import { MarginMode } from "@orderly.network/types";
import { toast, useScreen } from "@orderly.network/ui";
import { formatSymbol } from "@orderly.network/utils";

export type MarginModeSettingsScriptOptions = {
  close?: () => void;
};

export type MarginModeSettingsItem = {
  key: string;
  symbol: string;
};

export const useMarginModeSettingsScript = (
  options: MarginModeSettingsScriptOptions,
) => {
  const { isMobile } = useScreen();

  // Fetch markets data using the same API as markets list
  const [markets] = useMarkets(MarketsType.ALL);

  // Convert MarketsItem[] to MarginModeSettingsItem[]
  const items = useMemo(() => {
    if (!markets || markets.length === 0) {
      return [];
    }

    return markets.map((market) => ({
      key: market.symbol, // Original symbol: "PERP_BTC_USDC"
      symbol: formatSymbol(market.symbol, "base-type"), // Formatted: "BTC-PERP"
    }));
  }, [markets]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // Fetch margin modes from API
  const {
    marginModes,
    isLoading: isMarginModesLoading,
    updateMarginMode,
    isMutating: isSettingMarginMode,
  } = useMarginModes();

  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (markets.length > 0) {
      setIsDataLoading(false);
    }
  }, [markets]);

  // Get margin modes from API
  const itemMarginModes = useMemo(() => {
    const result: Record<string, MarginMode> = {};
    for (const item of items) {
      const marginMode = marginModes[item.key];
      // Default to CROSS if not found in API response
      result[item.key] = marginMode ?? MarginMode.CROSS;
    }
    return result;
  }, [items, marginModes]);

  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.symbol.toLowerCase().includes(keyword));
  }, [items, searchKeyword]);

  const visibleSelectedCount = useMemo(() => {
    return filteredItems.filter((item) => selectedKeys.has(item.key)).length;
  }, [filteredItems, selectedKeys]);

  const isSelectAll = useMemo(() => {
    return (
      filteredItems.length > 0 && visibleSelectedCount === filteredItems.length
    );
  }, [filteredItems.length, visibleSelectedCount]);

  const isIndeterminate = useMemo(() => {
    return (
      visibleSelectedCount > 0 && visibleSelectedCount < filteredItems.length
    );
  }, [filteredItems.length, visibleSelectedCount]);

  // Calculate margin mode statistics for selected items
  const selectedMarginModeStats = useMemo(() => {
    let crossCount = 0;
    let isolatedCount = 0;

    selectedKeys.forEach((key) => {
      const mode = itemMarginModes[key] ?? MarginMode.CROSS;
      if (mode === MarginMode.CROSS) {
        crossCount++;
      } else {
        isolatedCount++;
      }
    });

    return {
      crossCount,
      isolatedCount,
      isCrossButtonDisabled: crossCount > 0 && isolatedCount === 0,
      isIsolatedButtonDisabled: isolatedCount > 0 && crossCount === 0,
    };
  }, [selectedKeys, itemMarginModes]);

  const onSearchChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const onToggleItem = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const onToggleSelectAll = useCallback(() => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (isSelectAll) {
        for (const item of filteredItems) {
          next.delete(item.key);
        }
        return next;
      }

      for (const item of filteredItems) {
        next.add(item.key);
      }
      return next;
    });
  }, [filteredItems, isSelectAll]);

  const onSetMarginMode = useCallback(
    async (mode: MarginMode) => {
      if (selectedKeys.size === 0) return;

      setIsOperationLoading(true);
      try {
        // Build request payload
        const payload = {
          symbol_list: Array.from(selectedKeys),
          default_margin_mode: mode,
        };

        // Call API to update margin modes and refresh data
        await updateMarginMode(payload);
        toast.success("Updated successfully");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update margin mode",
        );
      } finally {
        setIsOperationLoading(false);
      }
    },
    [selectedKeys, updateMarginMode],
  );

  const isLoading =
    isDataLoading ||
    isMarginModesLoading ||
    isOperationLoading ||
    isSettingMarginMode;

  return {
    isMobile,
    close: options.close,

    items,
    filteredItems,
    searchKeyword,
    selectedKeys,
    itemMarginModes,
    isSelectAll,
    isIndeterminate,
    isLoading,
    isCrossButtonDisabled: selectedMarginModeStats.isCrossButtonDisabled,
    isIsolatedButtonDisabled: selectedMarginModeStats.isIsolatedButtonDisabled,

    onSearchChange,
    onToggleItem,
    onToggleSelectAll,
    onSetMarginMode,
  };
};

export type MarginModeSettingsState = ReturnType<
  typeof useMarginModeSettingsScript
>;
