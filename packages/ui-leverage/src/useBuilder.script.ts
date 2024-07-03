import { useMarginRatio } from "@orderly.network/hooks";

export const useLeverageBuilder = () => {
  const { currentLeverage } = useMarginRatio();
  return {
    currentLeverage,
  };
};

export type UseLeverageBuilder = ReturnType<typeof useLeverageBuilder>;
