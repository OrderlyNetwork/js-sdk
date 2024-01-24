import { useDebounce, useWS } from "@orderly.network/hooks";
import { useEffect, useState } from "react";

export function useIndexPrices() {
  const ws = useWS();

  const [indexPrices, setIndexPrices] = useState<Record<string, number>>({});
  const [debounceIndexPrices] = useDebounce(indexPrices, 5000, {
    leading: true,
    maxWait: 5000,
  });

  useEffect(() => {
    const unsubscribe = ws.subscribe("indexprices", {
      onMessage: (data: any[]) => {
        console.log("indexprices", data);
        const obj: Record<string, number> = {};
        data.forEach((item) => {
          const split = item.symbol.split("_");
          obj[split[1]] = item.price;
        });
        setIndexPrices(obj);
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return debounceIndexPrices;
}
