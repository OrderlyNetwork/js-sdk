import { useCallback, useMemo, useState } from "react";
import { useCollateral, useMutation } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export type AdjustMarginTab = "add" | "reduce";

type PositionWithMargin = API.PositionTPSLExt & { margin?: number };

export interface AdjustMarginScriptProps {
  position: API.PositionTPSLExt;
  symbol: string;
  close: () => void;
}

export interface AdjustMarginState {
  symbol: string;
  tab: AdjustMarginTab;
  inputValue: string;
  sliderValue: number;
  maxAmount: number;
  currentMargin: number;
  liquidationPrice: number;
  effectiveLeverage: number;
  isLoading: boolean;
  isAdd: boolean;
  onTabChange: (tab: AdjustMarginTab) => void;
  onInputChange: (value: string) => void;
  onSliderChange: (value: number) => void;
  onConfirm: () => Promise<void>;
  close: () => void;
}

export const useAdjustMarginScript = (
  props: AdjustMarginScriptProps,
): AdjustMarginState => {
  const { position, symbol, close } = props;
  const { t } = useTranslation();

  const [tab, setTab] = useState<AdjustMarginTab>("add");
  const [inputValue, setInputValue] = useState("");
  const [sliderValue, setSliderValue] = useState(0);

  const { freeCollateral } = useCollateral({ dp: 2 });
  const [updateMargin, { isMutating: isLoading }] = useMutation(
    "/v1/position/update_margin",
    "POST",
  );

  const currentMargin = useMemo(() => {
    const margin = (position as PositionWithMargin).margin ?? position.mm ?? 0;
    return new Decimal(margin);
  }, [position]);

  const maxAddAmount = useMemo(
    () => new Decimal(freeCollateral || 0),
    [freeCollateral],
  );

  const maxReduceAmount = useMemo(() => {
    const minRequired = new Decimal(position.mm || 0);
    const diff = currentMargin.sub(minRequired);
    return diff.isPositive() ? diff : new Decimal(0);
  }, [currentMargin, position.mm]);

  const maxAmount = useMemo(
    () => (tab === "add" ? maxAddAmount : maxReduceAmount),
    [tab, maxAddAmount, maxReduceAmount],
  );

  const syncSliderFromInput = useCallback(
    (value: string) => {
      if (!value) {
        setSliderValue(0);
        return;
      }
      const val = new Decimal(value);
      if (maxAmount.isZero()) {
        setSliderValue(0);
        return;
      }
      const percent = val.div(maxAmount).mul(100).toNumber();
      setSliderValue(Math.min(100, Math.max(0, percent)));
    },
    [maxAmount],
  );

  const syncInputFromSlider = useCallback(
    (value: number) => {
      const val = maxAmount.mul(value).div(100);
      setInputValue(val.toFixed(2, Decimal.ROUND_DOWN));
    },
    [maxAmount],
  );

  const onInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      syncSliderFromInput(value);
    },
    [syncSliderFromInput],
  );

  const onSliderChange = useCallback(
    (value: number) => {
      setSliderValue(value);
      syncInputFromSlider(value);
    },
    [syncInputFromSlider],
  );

  const onTabChange = useCallback((nextTab: AdjustMarginTab) => {
    setTab(nextTab);
    setInputValue("");
    setSliderValue(0);
  }, []);

  const finalMargin = useMemo(() => {
    const delta = new Decimal(inputValue || 0);
    if (tab === "add") return currentMargin.add(delta);
    return currentMargin.sub(delta);
  }, [currentMargin, inputValue, tab]);

  const liquidationPrice = useMemo(() => {
    // Placeholder: domain formula to be integrated.
    return 0;
  }, [finalMargin, position]);

  const effectiveLeverage = useMemo(() => {
    const notional = new Decimal(position.notional || 0).abs();
    if (finalMargin.isZero()) return 0;
    return notional.div(finalMargin).toNumber();
  }, [position.notional, finalMargin]);

  const onConfirm = useCallback(async () => {
    if (!inputValue || new Decimal(inputValue).isZero()) return;
    try {
      const payload = {
        symbol,
        margin: new Decimal(inputValue).toNumber(),
        side: tab === "add" ? "ADD" : "REDUCE",
      };
      await updateMargin(payload);
      toast.success(t("positions.adjustMargin.success"));
      close();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(message || t("positions.adjustMargin.failed"));
    }
  }, [close, inputValue, symbol, t, tab, updateMargin]);

  return {
    symbol,
    tab,
    inputValue,
    sliderValue,
    maxAmount: maxAmount.toNumber(),
    currentMargin: currentMargin.toNumber(),
    liquidationPrice,
    effectiveLeverage,
    isLoading,
    isAdd: tab === "add",
    onTabChange,
    onInputChange,
    onSliderChange,
    onConfirm,
    close,
  };
};
