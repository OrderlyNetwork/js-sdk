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
      label={"Pred.funding rate"}
      value={
        <div className="orderly-flex flex-nowrap">
          <Numeral rule="percentages" className="orderly-text-warning">
            {data.est_funding_rate}
          </Numeral>
          <span className="orderly-ml-1 orderly-break-normal orderly-whitespace-nowrap">{`in ${data.countDown}`}</span>
        </div>
      }
    />
  );
};

export const MemoizedCompnent = memo(FundingRate);
