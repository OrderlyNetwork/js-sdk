import { useIndexPriceStore } from "./useIndexPrice/useIndexPriceStore";

export const useIndexPricesStream = () => {
  const data = useIndexPriceStore((state) => state.indexPrices);
  return { data };
};
