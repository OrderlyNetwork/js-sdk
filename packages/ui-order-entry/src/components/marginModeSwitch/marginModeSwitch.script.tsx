import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetMarginModes, useSetMarginMode } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { MarginMode } from "@orderly.network/types";
import { toast, useScreen } from "@orderly.network/ui";

export type MarginModeSwitchScriptOptions = {
  symbol: string;
  close?: () => void;
};

export const useMarginModeSwitchScript = (
  options: MarginModeSwitchScriptOptions,
) => {
  const { symbol, close } = options;
  const { isMobile } = useScreen();
  const { t } = useTranslation();

  const { marginModes, refresh: refreshMarginModes } = useGetMarginModes();
  const { setMarginMode } = useSetMarginMode();

  const currentMarginMode = useMemo<MarginMode>(
    () => marginModes[symbol] ?? MarginMode.CROSS,
    [marginModes, symbol],
  );

  const [selectedMarginMode, setSelectedMarginMode] =
    useState<MarginMode>(currentMarginMode);

  useEffect(() => {
    setSelectedMarginMode(currentMarginMode);
  }, [currentMarginMode]);

  const applyMarginMode = useCallback(
    async (mode: MarginMode) => {
      const payload = {
        symbol_list: [symbol],
        default_margin_mode: mode,
      };

      const result = await setMarginMode(payload);

      if (result.success) {
        await refreshMarginModes();
        setSelectedMarginMode(mode);
        return { success: true as const };
      } else {
        throw new Error(result.message || "Failed to update margin mode");
      }
    },
    [symbol, setMarginMode, refreshMarginModes],
  );

  const onSelect = useCallback(
    (mode: MarginMode) => {
      if (mode === currentMarginMode) {
        close?.();
        return;
      }

      close?.();

      applyMarginMode(mode)
        .then((res) => {
          if (res?.success) {
            toast.success(t("marginMode.updatedSuccessfully"));
          }
        })
        .catch((error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update margin mode",
          );
        });
    },
    [applyMarginMode, close, currentMarginMode, t],
  );

  return {
    symbol,
    isMobile,
    currentMarginMode,
    selectedMarginMode,
    setSelectedMarginMode,
    applyMarginMode,
    close,
    onSelect,
  };
};

export type MarginModeSwitchState = ReturnType<
  typeof useMarginModeSwitchScript
>;
