import { FC } from "react";
import { Statistic } from "@/statistic";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { useTickerStream } from "@orderly.network/hooks";
import { Numeral } from "@/text";
import { MemoizedCompnent } from "./fundingRate";

interface Props {
  symbol: string;
}

export const Ticker: FC<Props> = (props) => {
  const { symbol } = props;
  const data = useTickerStream(symbol);

  return (
    <StatisticStyleProvider
      labelClassName="orderly-text-4xs orderly-text-base-contrast-54"
      valueClassName={"orderly-text-2xs orderly-text-base-contrast-80"}
    >
      <div className="orderly-flex orderly-space-x-5 orderly-items-center orderly-h-full orderly-overflow-x-auto">
        <div>
          <Numeral coloring>{data?.["24h_close"]}</Numeral>
        </div>
        <Statistic
          label={"24h change"}
          value={
            <div className={"orderly-flex orderly-space-x-1"}>
              <Numeral coloring>{data?.["24h_close"]}</Numeral>
              <span className={"orderly-text-base-contrast-54"}>/</span>
              <Numeral coloring rule={"percentages"}>
                {data?.change || 0}
              </Numeral>
            </div>
          }
        />
        <Statistic label={"Mark"} value={data?.mark_price} rule={"price"} />
        <Statistic label={"Index"} value={data?.index_price} rule={"price"} />
        <Statistic
          label={"24h volume"}
          value={data?.["24h_volume"]}
          rule={"human"}
        />
        <MemoizedCompnent symbol={props.symbol} />
      </div>
    </StatisticStyleProvider>
  );
};
