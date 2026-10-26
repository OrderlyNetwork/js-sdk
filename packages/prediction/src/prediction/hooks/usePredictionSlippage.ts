import { useCallback } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { parseSlippageTicks } from "../binary/binaryOrderRules";

/** Shared by the trade panel and every per-row sell popover. */
export const PREDICTION_SLIPPAGE_STORAGE_KEY =
  "orderly-prediction-slippage-ticks";
const DEFAULT_SLIPPAGE = "2";

export const usePredictionSlippage = () => {
  const [storedSlippage, saveSlippage] = useLocalStorage(
    PREDICTION_SLIPPAGE_STORAGE_KEY,
    DEFAULT_SLIPPAGE,
  );
  const slippage =
    parseSlippageTicks(storedSlippage) == null
      ? DEFAULT_SLIPPAGE
      : storedSlippage;
  const setSlippage = useCallback(
    (value: string) => {
      if (parseSlippageTicks(value) != null)
        saveSlippage(String(Number(value)));
    },
    [saveSlippage],
  );
  return { slippage, setSlippage };
};
