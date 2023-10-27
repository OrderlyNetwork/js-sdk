import { FC, useContext } from "react";
import { useMarkPrice, useTickerStream } from "@orderly.network/hooks";
import { Numeral, Text } from "@/text";
import { SymbolContext } from "@/provider";

interface Props {
  symbol: string;
}

export const TradeData: FC<Props> = (props) => {
  const { symbol } = props;
  const ticker = useTickerStream(symbol);
  const { quote_dp, base_dp } = useContext(SymbolContext);

  // console.log(ticker);

  return (
    <div className="h-[240px] p-4 relative">
      <table className="w-full text-sm">
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">Mark Price</td>
          <td className="text-right">
            <Numeral precision={quote_dp}>{ticker?.mark_price}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">Index Price</td>
          <td className="text-right">
            <Numeral precision={quote_dp}>{ticker?.index_price}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">24h Volume</td>
          <td className="text-right">
            <Numeral.total
              rule="human"
              precision={2}
              price={ticker?.["24h_close"]}
              quantity={ticker?.["24h_volumn"]}
            />
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">24h High</td>
          <td className="text-right">
            <Numeral precision={quote_dp}>{ticker?.["24h_high"]}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast/50">24h Low</td>
          <td className="text-right">
            <Numeral precision={quote_dp}>{ticker?.["24h_low"]}</Numeral>
          </td>
        </tr>
        {/* <tr className="h-[28px]">
          <td className="text-base-contrast/50">Open Interest</td>
          <td className="text-right">
            <Text>{ticker?.["open_interest"]}</Text>
          </td>
        </tr> */}
      </table>
    </div>
  );
};
