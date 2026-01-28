import { useCallback, useEffect, useState } from "react";
import { useMarginModeBySymbol } from "@orderly.network/hooks";
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

  const { marginMode: currentMarginMode, update } =
    useMarginModeBySymbol(symbol);

  const [selectedMarginMode, setSelectedMarginMode] =
    useState<MarginMode>(currentMarginMode);

  useEffect(() => {
    setSelectedMarginMode(currentMarginMode);
  }, [currentMarginMode]);

  const applyMarginMode = useCallback(
    async (mode: MarginMode) => {
      const result = await update(mode);
      setSelectedMarginMode(mode);
      return result;
    },
    [update],
  );

  const onSelect = useCallback(
    (mode: MarginMode) => {
      if (mode === currentMarginMode) {
        close?.();
        return;
      }

      close?.();

      applyMarginMode(mode)
        .then(() => {
          toast.success(t("marginMode.updatedSuccessfully"));
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
