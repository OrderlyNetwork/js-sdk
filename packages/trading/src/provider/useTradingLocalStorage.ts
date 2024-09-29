import { useLocalStorage } from "@orderly.network/hooks";

export const useTradingLocalStorage = () => {
  const [unPnlPriceBasis, setUnPnlPriceBasic] = useLocalStorage(
    "unPnlPriceBasis",
    "markPrice"
  );
  const [pnlNotionalDecimalPrecision, setPnlNotionalDecimalPrecision] =
    useLocalStorage("pnlNotionalDecimalPrecision", 2);
  const [showAllSymbol, setShowAllSymbol] = useLocalStorage(
    "showAllSymbol",
    true
  );

  return {
    unPnlPriceBasis,
    setUnPnlPriceBasic,
    pnlNotionalDecimalPrecision,
    setPnlNotionalDecimalPrecision,
    showAllSymbol,
    setShowAllSymbol,
  };
};
