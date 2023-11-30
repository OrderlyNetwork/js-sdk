import { Statistic } from "@/statistic";
import { FC, useEffect, useState } from "react";
import { timeConvertString } from "@orderly.network/utils";

export interface FundingRateProps {
  fundingRate: string;
  timout: number;
}

export const FundingRate: FC<FundingRateProps> = (props) => {
  const [time, setTime] = useState("00:00:00");
  useEffect(() => {
    if (!props.timout || props.timout <= 0) {
      return;
    }

    const timer = setInterval(() => {
      const diff = new Date(props.timout).getTime() - Date.now();
      const result = timeConvertString(diff);

      if (result.length === 3) {
        setTime(
          `${result[0].toString().padStart(2, "0")}:${result[1]
            .toString()
            .padStart(2, "0")}:${result[2].toString().padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [props.timout]);

  return (
    <Statistic
      label="Pred. funding rate"
      value={
        <div className="orderly-flex orderly-items-center">
          <span className="orderly-text-yellow-500">{`${props.fundingRate}%`}</span>
          <span className="orderly-text-gray-400 orderly-ml-1">{`in ${time}`}</span>
        </div>
      }
    />
  );
};
