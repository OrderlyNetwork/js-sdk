import { API, SDKError } from "@orderly.network/types";
import { useQuery } from "../useQuery";
import { useEffect, useMemo, useState } from "react";
import {
  Decimal,
  getTimestamp,
  timeConvertString,
} from "@orderly.network/utils";

export const useFundingRate = (symbol: string) => {
  if (!symbol) {
    throw new SDKError("Symbol is required");
  }

  const [countDown, setCountDown] = useState("00:00:00");

  const { data } = useQuery<API.FundingRate>(
    `/v1/public/funding_rate/${symbol}`,
    {
      fallbackData: {
        est_funding_rate: 0,
        next_funing_time: 0,
      },
    }
  );

  useEffect(() => {
    if (!data) return;
    const { next_funding_time } = data;
    if (!next_funding_time || next_funding_time <= 0) {
      return;
    }
    const timer = setInterval(() => {
      const diff = new Date(next_funding_time).getTime() - getTimestamp();
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
      clearInterval(timer as unknown as number);
    };
  }, [data]);

  const est_funding_rate = useMemo(() => {
    if (!data) return;

    const { next_funding_time, est_funding_rate = 0 } = data;

    if (getTimestamp() > next_funding_time) {
      return null;
    }

    return new Decimal(Number(est_funding_rate) * 100).toFixed(
      4,
      Decimal.ROUND_DOWN
    );
  }, [data]);

  return {
    ...data,
    est_funding_rate,
    countDown,
  };
};
