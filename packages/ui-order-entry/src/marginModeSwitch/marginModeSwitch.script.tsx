import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";

export type MarginMode = "cross" | "isolated";

export type MarginModeSwitchScriptOptions = {
  symbol: string;
  /**
   * Optional initial value injected by caller.
   * If not provided, script will fall back to local storage (per-symbol).
   */
  currentMarginMode?: MarginMode;
  close?: () => void;
};

const marginModeStorageKey = (symbol: string) => `orderly.marginMode.${symbol}`;

export const useMarginModeSwitchScript = (
  options: MarginModeSwitchScriptOptions,
) => {
  const { symbol, currentMarginMode: injectedMarginMode } = options;
  const { isMobile } = useScreen();

  const [storedMarginMode, setStoredMarginMode] = useLocalStorage<MarginMode>(
    marginModeStorageKey(symbol),
    "cross",
  );

  const currentMarginMode = useMemo<MarginMode>(() => {
    return injectedMarginMode ?? storedMarginMode ?? "cross";
  }, [injectedMarginMode, storedMarginMode]);

  const [selectedMarginMode, setSelectedMarginMode] =
    useState<MarginMode>(currentMarginMode);

  useEffect(() => {
    setSelectedMarginMode(currentMarginMode);
  }, [currentMarginMode]);

  const applyMarginMode = useCallback(
    async (mode: MarginMode) => {
      // Local persistence first. Backend integration can be added later when API is confirmed.
      setStoredMarginMode(mode);
      setSelectedMarginMode(mode);
      return { success: true as const };
    },
    [setStoredMarginMode],
  );

  return {
    symbol,
    isMobile,
    currentMarginMode,
    selectedMarginMode,
    setSelectedMarginMode,
    applyMarginMode,
    close: options.close,
  };
};

export type MarginModeSwitchState = ReturnType<
  typeof useMarginModeSwitchScript
>;
