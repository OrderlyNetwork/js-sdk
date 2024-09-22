import { useLocalStorage } from "@orderly.network/hooks";

export const useSettingScript = (props: {
  pnlNotionalDecimalPrecision: any;
  setPnlNotionalDecimalPrecision: (value: number) => void;
  unPnlPriceBasis: any;
  setUnPnlPriceBasic: (value: string) => void;
  showAllSymbol: any;
  setShowAllSymbol: (value: boolean) => void;
}) => {
  const {
    pnlNotionalDecimalPrecision,
    setPnlNotionalDecimalPrecision,
    unPnlPriceBasis,
    setUnPnlPriceBasic,
    showAllSymbol,
    setShowAllSymbol,
  } = props;
  return {
    pnlNotionalDecimalPrecision,
    setPnlNotionalDecimalPrecision,
    unPnlPriceBasis,
    setUnPnlPriceBasic,
    showAllSymbol,
    setShowAllSymbol,
  };
};

export type SettingState = ReturnType<typeof useSettingScript>;
