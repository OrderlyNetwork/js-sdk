import { FC } from "react";
import { useMarkPrice, useTickerStream } from "@orderly.network/hooks";
import { Numeral, Text } from "@/text";

interface Props {
  symbol: string;
}

export const TradeData: FC<Props> = (props) => {
  const { symbol } = props;

  // const { data: markPrice } = useMarkPrice(symbol);
  const ticker = useTickerStream(symbol);

  console.log(ticker);

  return (
    <div className="h-[300px] p-4">
      <table className="w-full text-sm">
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">Mark Price</td>
          <td className="text-right">
            <Numeral>{ticker?.mark_price}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">Index Price</td>
          <td className="text-right">
            <Numeral>{ticker?.index_price}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">24h Volume</td>
          <td className="text-right">{ticker?.["24h_volumn"]}</td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">24h High</td>
          <td className="text-right">{ticker?.["24h_high"]}</td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">24h Low</td>
          <td className="text-right">{ticker?.["24h_low"]}</td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">Open Interest</td>
          <td className="text-right">
            <Text>{ticker?.["open_interest"]}</Text>
          </td>
        </tr>
      </table>
    </div>
  );
};
