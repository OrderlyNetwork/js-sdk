import { useCallback, useEffect, useMemo, useState } from "react";
import { useMarkets, MarketsType } from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";
import { formatSymbol } from "@orderly.network/utils";

export type MarginMode = "cross" | "isolated";

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

  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (markets.length > 0) {
      setIsDataLoading(false);
    }
  }, [markets]);

  // TODO: Replace with backend API to fetch margin modes for all symbols
  const [itemMarginModes, setItemMarginModes] = useState<
    Record<string, MarginMode>
  >({});

  // TODO: Replace with backend API call to load margin modes on component mount
  useEffect(() => {
    if (items.length > 0) {
      setItemMarginModes((prev) => {
        const next: Record<string, MarginMode> = {};
        for (const item of items) {
          next[item.key] = prev[item.key] ?? "cross";
        }
        return next;
      });
    }
  }, [items]);

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
        // TODO: Replace with backend API call to batch update margin modes for selected symbols
        setItemMarginModes((prev) => {
          const next = { ...prev };
          selectedKeys.forEach((key) => {
            next[key] = mode;
          });
          return next;
        });
      } finally {
        setIsOperationLoading(false);
      }
    },
    [selectedKeys],
  );

  const isLoading = isDataLoading || isOperationLoading;

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

    onSearchChange,
    onToggleItem,
    onToggleSelectAll,
    onSetMarginMode,
  };
};

export type MarginModeSettingsState = ReturnType<
  typeof useMarginModeSettingsScript
>;
