import {
  useFundingRate,
  useMarketsStore,
  useSymbolsInfo,
  useTickerStream,
} from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { useEffect, useMemo, useRef, useState } from "react";

export type UseSymbolInfoBarFullScriptOptions = {
  symbol: string;
};

export type UseSymbolInfoBarFullScriptReturn = ReturnType<
  typeof useSymbolInfoBarFullScript
>;

export function useSymbolInfoBarFullScript(
  options: UseSymbolInfoBarFullScriptOptions
) {
  const { symbol } = options;

  const data = useTickerStream(symbol);
  const fundingRate = useFundingRate(symbol);

  const favorite = useMarketsStore();

  const info = useSymbolsInfo();
  const quotoDp = info[symbol]("quote_dp");
  const [leadingVisible, setLeadingVisible] = useState(false);
  const [tailingVisible, setTailingVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leadingElementRef = useRef<HTMLDivElement>(null);
  const tailingElementRef = useRef<HTMLDivElement>(null);

  const isFavorite = useMemo(
    () => !!favorite.favorites.find((item) => item.name === symbol),
    [favorite.favorites, symbol]
  );

  const openInterest = useMemo(
    () =>
      new Decimal(data?.open_interest ?? 0)
        .mul(data?.index_price ?? 0)
        .toDecimalPlaces(2)
        .valueOf(),
    [data]
  );

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      for (let index = 0; index < entries.length; index++) {
        const item = entries[index];
        if (item) {
          if (item.target === leadingElementRef.current) {
            setLeadingVisible(!item.isIntersecting);
          }

          if (item.target === tailingElementRef.current) {
            setTailingVisible(!item.isIntersecting);
          }
        }
      }
    });
    if (leadingElementRef.current) {
      intersectionObserver.observe(leadingElementRef.current);
    }

    if (tailingElementRef.current) {
      intersectionObserver.observe(tailingElementRef.current);
    }

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  const onScoll = (direction: string) => {
    if (direction === "left")
      containerRef.current?.scrollBy({ left: -100, behavior: "smooth" });
    else containerRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  };

  return {
    symbol,
    isFavorite,
    favorite,
    data,
    quotoDp,
    openInterest,
    fundingRate,
    containerRef,
    leadingElementRef,
    tailingElementRef,
    leadingVisible,
    tailingVisible,
    onScoll,
  };
}
