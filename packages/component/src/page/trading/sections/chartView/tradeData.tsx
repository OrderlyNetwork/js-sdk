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

  //

  return (
    <div className="h-[240px] p-4 relative">
      <table className="w-full text-3xs">
        <tr className="h-[28px]">
          <td className="text-base-contrast-54">Mark price</td>
          <td className="text-right text-base-contrast">
            <Numeral precision={quote_dp}>{ticker?.mark_price}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast-54">Index price</td>
          <td className="text-right text-base-contrast">
            <Numeral precision={quote_dp}>{ticker?.index_price}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast-54">24h volume</td>
          <td className="text-right text-base-contrast">
            <Numeral.total
              rule="human"
              precision={2}
              price={ticker?.["24h_close"]}
              quantity={ticker?.["24h_volumn"]}
            />
            <Text
              rule="symbol"
              symbolElement="quote"
              className="text-base-contrast-36 ml-2"
            >
              {symbol}
            </Text>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast-54">24h high</td>
          <td className="text-right text-base-contrast">
            <Numeral precision={quote_dp}>{ticker?.["24h_high"]}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
          <td className="text-base-contrast-54">24h low</td>
          <td className="text-right text-base-contrast">
            <Numeral precision={quote_dp}>{ticker?.["24h_low"]}</Numeral>
          </td>
        </tr>
        <tr className="h-[28px]">
            <td className="text-base-contrast-54">Open interest</td>
            <td className="text-right text-base-contrast">
              { ticker?.["open_interest"] ? (<Numeral.total
              rule="human"
              precision={2}
              price={ticker?.["mark_price"]}
              quantity={ticker?.["open_interest"]}
            />) : "--" }
              
              <Text
                className="text-base-contrast-36 ml-2"
              >
                USDC
              </Text>
            </td>
          </tr>
      </table>
    </div>
  );
};
