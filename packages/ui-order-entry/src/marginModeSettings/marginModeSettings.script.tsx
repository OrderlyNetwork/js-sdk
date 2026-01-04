import { useCallback, useMemo, useState } from "react";
import { useScreen } from "@orderly.network/ui";

export type MarginMode = "cross" | "isolated";

export type MarginModeSettingsScriptOptions = {
  close?: () => void;
};

export type MarginModeSettingsItem = {
  key: string;
  symbol: string;
};

type MarginModeSettingsDataAdapter = {
  getItems: () => MarginModeSettingsItem[];
};

const STATIC_SYMBOLS = [
  "BTC-PERP",
  "ETH-PERP",
  "WOO-PERP",
  "ORDER-PERP",
  "UNI-PERP",
  "SOL-PERP",
  "ETC-PERP",
  "DOGE-PERP",
] as const;

const createStaticDataAdapter = (): MarginModeSettingsDataAdapter => {
  return {
    getItems: () => {
      const repeatCount = 3;
      const items: MarginModeSettingsItem[] = [];
      for (let i = 0; i < repeatCount; i++) {
        for (const symbol of STATIC_SYMBOLS) {
          items.push({ key: `${symbol}-${i}`, symbol });
        }
      }
      return items;
    },
  };
};

export const useMarginModeSettingsScript = (
  options: MarginModeSettingsScriptOptions,
) => {
  const { isMobile } = useScreen();

  const dataAdapter = useMemo(() => createStaticDataAdapter(), []);
  const items = useMemo(() => dataAdapter.getItems(), [dataAdapter]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);

  const [itemMarginModes, setItemMarginModes] = useState<
    Record<string, MarginMode>
  >(() => {
    const initial: Record<string, MarginMode> = {};
    for (const item of items) {
      initial[item.key] = "cross";
    }
    return initial;
  });

  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.symbol.toLowerCase().includes(keyword));
  }, [items, searchKeyword]);

  const visibleSelectedCount = useMemo(() => {
    let count = 0;
    for (const item of filteredItems) {
      if (selectedKeys.has(item.key)) count++;
    }
    return count;
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

      setIsLoading(true);
      try {
        setItemMarginModes((prev) => {
          const next = { ...prev };
          selectedKeys.forEach((key) => {
            next[key] = mode;
          });
          return next;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedKeys],
  );

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
