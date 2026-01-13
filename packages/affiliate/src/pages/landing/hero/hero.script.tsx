import { useMemo, useCallback } from "react";
import { useReferralContext } from "../../../provider";

export interface UseHeroScriptOptions {
  onTradeClick?: () => void;
}

export const useHeroScript = (options?: UseHeroScriptOptions) => {
  const { generateCode } = useReferralContext();
  const { onTradeClick } = options || {};

  // Get current and target volume
  const currentVolume = useMemo(() => {
    return generateCode?.completedVolume ?? 0;
  }, [generateCode]);

  const targetVolume = useMemo(() => {
    return generateCode?.requireVolume ?? 100000;
  }, [generateCode]);

  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (onTradeClick) {
      onTradeClick();
    } else {
      // Default behavior: could navigate to trading page
      console.log("Navigate to trading page");
    }
  }, [onTradeClick]);

  return {
    currentVolume,
    targetVolume,
    onButtonClick: handleButtonClick,
  };
};

export type HeroState = ReturnType<typeof useHeroScript>;
