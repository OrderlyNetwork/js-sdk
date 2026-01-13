import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";

export interface UseProgressSectionScriptOptions {
  currentVolume?: number;
  targetVolume?: number;
  onButtonClick?: () => void;
}

export const useProgressSectionScript = (
  options?: UseProgressSectionScriptOptions,
) => {
  const {
    currentVolume = 3000,
    targetVolume = 100000,
    onButtonClick,
  } = options || {};

  // Calculate progress percentage using Decimal to avoid floating point issues
  const progressPercentage = useMemo(() => {
    if (targetVolume === 0) return 0;
    const percentage = new Decimal(currentVolume)
      .div(targetVolume)
      .mul(100)
      .toNumber();
    return Math.min(percentage, 100); // Cap at 100%
  }, [currentVolume, targetVolume]);

  // Check if unlocked
  const isUnlocked = useMemo(() => {
    return currentVolume >= targetVolume;
  }, [currentVolume, targetVolume]);

  return {
    progressPercentage,
    currentVolume,
    // formattedTarget,
    isUnlocked,
    targetVolume,
    onButtonClick,
  };
};

export type ProgressSectionState = ReturnType<typeof useProgressSectionScript>;
