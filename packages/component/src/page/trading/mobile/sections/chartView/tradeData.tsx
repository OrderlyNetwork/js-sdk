import { FC, useContext } from "react";
import { useMarkPrice, useTickerStream } from "@orderly.network/hooks";
import { Numeral, Text } from "@/text";
import { SymbolContext } from "@/provider";
import { OrderlyIcon } from "@/icon";

interface Props {
  symbol: string;
}

export const TradeData: FC<Props> = (props) => {
  const { symbol } = props;
  const ticker = useTickerStream(symbol);
  const { quote_dp, base_dp } = useContext(SymbolContext);

  //

  return (
    <div className="orderly-h-[240px] orderly-p-4 orderly-relative">
      <table className="orderly-w-full orderly-text-3xs">
        <tr className="orderly-h-[28px]">
          <td className="orderly-text-base-contrast-54">Mark price</td>
          <td className="orderly-text-right orderly-text-base-contrast">
            <Numeral precision={quote_dp}>{ticker?.mark_price}</Numeral>
          </td>
        </tr>
        <tr className="orderly-h-[28px]">
          <td className="orderly-text-base-contrast-54">Index price</td>
          <td className="orderly-text-right orderly-text-base-contrast">
            <Numeral precision={quote_dp}>{ticker?.index_price}</Numeral>
          </td>
        </tr>
        <tr className="orderly-h-[28px]">
          <td className="orderly-text-base-contrast-54 ">
            <div className="orderly-flex orderly-items-center">
              <div>24h volume</div>
              <OrderlyIcon size={14} className="orderly-ml-[6px]" />
            </div>
          </td>
          <td className="orderly-text-right orderly-text-base-contrast">
            <Numeral.total
              rule="human"
              precision={2}
              price={ticker?.["24h_close"]}
              quantity={ticker?.["24h_volume"]}
            />
            <Text
              rule="symbol"
              symbolElement="quote"
              className="orderly-text-base-contrast-36 orderly-ml-2"
            >
              {symbol}
            </Text>
          </td>
        </tr>
        <tr className="orderly-h-[28px]">
          <td className="orderly-text-base-contrast-54">24h high</td>
          <td className="orderly-text-right orderly-text-base-contrast">
            <Numeral precision={quote_dp}>{ticker?.["24h_high"]}</Numeral>
          </td>
        </tr>
        <tr className="orderly-h-[28px]">
          <td className="orderly-text-base-contrast-54">24h low</td>
          <td className="orderly-text-right orderly-text-base-contrast">
            <Numeral precision={quote_dp}>{ticker?.["24h_low"]}</Numeral>
          </td>
        </tr>
        <tr className="orderly-h-[28px]">
          <td className="orderly-text-base-contrast-54">Open interest</td>
          <td className="orderly-text-right orderly-text-base-contrast">
            {ticker?.["open_interest"] ? (
              <Numeral.total
                rule="human"
                precision={2}
                price={ticker?.["mark_price"]}
                quantity={ticker?.["open_interest"]}
              />
            ) : (
              "--"
            )}

            <Text className="orderly-text-base-contrast-36 orderly-ml-2">
              USDC
            </Text>
          </td>
        </tr>
      </table>
    </div>
  );
};
