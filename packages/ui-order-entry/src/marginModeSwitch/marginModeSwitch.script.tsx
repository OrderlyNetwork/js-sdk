import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";

export type MarginMode = "cross" | "isolated";

export type MarginModeSwitchScriptOptions = {
  symbol: string;
  /**
   * Optional initial value injected by caller.
   * TODO: Replace with backend API per PRD.
   */
  currentMarginMode?: MarginMode;
  close?: () => void;
};

// TODO: Replace localStorage with backend API for margin mode persistence per PRD
const marginModeStorageKey = (symbol: string) => `orderly.marginMode.${symbol}`;

export const useMarginModeSwitchScript = (
  options: MarginModeSwitchScriptOptions,
) => {
  const { symbol, currentMarginMode: injectedMarginMode } = options;
  const { isMobile } = useScreen();

  // TODO: Replace with backend API to fetch margin mode per symbol
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
      // TODO: Replace with backend API call to update margin mode per symbol
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
