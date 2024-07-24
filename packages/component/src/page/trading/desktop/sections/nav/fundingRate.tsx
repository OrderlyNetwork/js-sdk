import { FC, memo, useMemo } from "react";
import { Statistic } from "@/statistic";
import { useFundingRate } from "@orderly.network/hooks";
import { Numeral } from "@/text";

interface Props {
  symbol: string;
}

const FundingRate: FC<Props> = (props) => {
  const data = useFundingRate(props.symbol);

  const value = useMemo(() => {
    if (data.est_funding_rate === null) {
      return "--";
    }

    return (
      <div className="orderly-flex flex-nowrap">
        <Numeral
          className="orderly-text-warning"
          unit="%"
          precision={4}
          padding
        >
          {data.est_funding_rate!}
        </Numeral>
        <span className="orderly-ml-1 orderly-break-normal orderly-whitespace-nowrap">{`in ${data.countDown}`}</span>
      </div>
    );
  }, [data]);

  return (
    <Statistic
      label={"Pred. funding rate"}
      value={value}
      hint="Funding rates are payments between traders who are long and short. When positive, long positions pay short positions funding. When negative, short positions pay long positions."
    />
  );
};

export const MemoizedCompnent = memo(FundingRate);
