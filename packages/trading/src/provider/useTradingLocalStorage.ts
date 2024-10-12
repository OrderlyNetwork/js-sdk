import { useLocalStorage } from "@orderly.network/hooks";

export const useTradingLocalStorage = (props?: {
  pnlNotionalDecimalPrecision?: number;
}) => {
  const [unPnlPriceBasis, setUnPnlPriceBasic] = useLocalStorage(
    "unPnlPriceBasis",
    "markPrice"
  );
  const [pnlNotionalDecimalPrecision, setPnlNotionalDecimalPrecision] =
    useLocalStorage("pnlNotionalDecimalPrecision", props?.pnlNotionalDecimalPrecision ?? 2);
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
