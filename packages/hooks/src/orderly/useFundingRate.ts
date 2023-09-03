import { API } from "@orderly.network/types";
import { useQuery } from "../useQuery";
import { useEffect, useState } from "react";
import { timeConvertString } from "@orderly.network/utils";

export const useFundingRate = (symbol: string) => {
  if (!symbol) {
    throw new Error("useFuturesForSymbol requires a symbol");
  }

  const [countDown, setCountDown] = useState("00:00:00");

  const { data } = useQuery<API.FundingRate>(`/public/funding_rate/${symbol}`, {
    fallbackData: {
      est_funding_rate: 0,
      next_funing_time: 0,
    },
  });

  useEffect(() => {
    if (!data) return;
    const { next_funding_time } = data;
    if (!next_funding_time || next_funding_time <= 0) {
      return;
    }
    const timer = setInterval(() => {
      const diff = new Date(next_funding_time).getTime() - Date.now();
      const result = timeConvertString(diff);
      if (result.length === 3) {
        setCountDown(
          `${result[0].toString().padStart(2, "0")}:${result[1]
            .toString()
            .padStart(2, "0")}:${result[2].toString().padStart(2, "0")}`
        );
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [data]);

  return {
    ...data,
    countDown,
  };
};
