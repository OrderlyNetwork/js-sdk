import { FC, memo } from "react";
import { Statistic } from "@/statistic";
import { useFundingRate } from "@orderly.network/hooks";
import { Numeral } from "@/text";

interface Props {
  symbol: string;
}

const FundingRate: FC<Props> = (props) => {
  const data = useFundingRate(props.symbol);

  return (
    <Statistic
      label={"Pred. funding rate"}
      value={
        <div className="orderly-flex flex-nowrap">
          <Numeral
            className="orderly-text-warning"
            unit="%"
            precision={4}
            padding
          >
            {data.est_funding_rate}
          </Numeral>
          <span className="orderly-ml-1 orderly-break-normal orderly-whitespace-nowrap">{`in ${data.countDown}`}</span>
        </div>
      }
    />
  );
};

export const MemoizedCompnent = memo(FundingRate);
