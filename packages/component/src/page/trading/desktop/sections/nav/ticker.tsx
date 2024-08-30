import { FC, useEffect, useRef, useState } from "react";
import { Statistic } from "@/statistic";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { useTickerStream } from "@orderly.network/hooks";
import { Numeral } from "@/text";
import { MemoizedCompnent } from "./fundingRate";
import { useSymbolContext } from "@/provider/symbolProvider";
import { TickerMask } from "./tickerMask";
import { NumeralWithCtx } from "@/text/numeralWithCtx";
import { OrderlyIcon } from "@/icon";
import { Decimal } from "@orderly.network/utils";

interface Props {
  symbol: string;
}

export const Ticker: FC<Props> = (props) => {
  const { symbol } = props;
  const data = useTickerStream(symbol);
  const [leadingVisible, setLeadingVisible] = useState(false);
  const [tailingVisible, setTailingVisible] = useState(false);

  const { base, quote } = useSymbolContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const leadingElementRef = useRef<HTMLDivElement>(null);
  const tailingElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      for (let index = 0; index < entries.length; index++) {
        const item = entries[index];
        if (item) {
          if (item.target === leadingElementRef.current) {
            setLeadingVisible(!item.isIntersecting);
          }

          if (item.target === tailingElementRef.current) {
            setTailingVisible(!item.isIntersecting);
          }
        }
      }
    });
    if (leadingElementRef.current) {
      intersectionObserver.observe(leadingElementRef.current);
    }

    if (tailingElementRef.current) {
      intersectionObserver.observe(tailingElementRef.current);
    }

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  const onScollButtonClick = (direction: string) => {
    if (direction === "left")
      containerRef.current?.scrollBy({ left: -100, behavior: "smooth" });
    else containerRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  };

  return (
    <StatisticStyleProvider
      labelClassName="orderly-text-4xs orderly-text-base-contrast-54 orderly-break-normal orderly-whitespace-nowrap"
      valueClassName={
        "orderly-text-2xs orderly-text-base-contrast-80 orderly-tabular-nums orderly-font-semibold"
      }
    >
      <div
        className="orderly-relative orderly-overflow-hidden"
        id="orderly-top-nav-ticker"
      >
        <div
          className="orderly-flex orderly-space-x-5 orderly-relative orderly-items-center orderly-h-full orderly-overflow-x-auto orderly-hide-scrollbar"
          ref={containerRef}
        >
          <div ref={leadingElementRef} orderly-text="16px">
            <NumeralWithCtx className="orderly-font-semibold">
              {data?.["24h_close"]}
            </NumeralWithCtx>
          </div>
          <Statistic
            label={"24h change"}
            value={
              <div className={"orderly-flex orderly-space-x-1"}>
                {/* @ts-ignore */}
                <NumeralWithCtx coloring>{data?.["24h_change"]}</NumeralWithCtx>
                <span className={"orderly-text-base-contrast-54"}>/</span>
                <Numeral coloring rule={"percentages"}>
                  {/* @ts-ignore */}
                  {data?.change || 0}
                </Numeral>
              </div>
            }
          />
          <Statistic
            id="orderly-top-nav-mark-price"
            label={"Mark"}
            value={
              <div id="orderly-top-nav-mark-price-value">
                <NumeralWithCtx>{data?.mark_price}</NumeralWithCtx>
              </div>
            }
            rule={"price"}
            hint="Price for the computation of unrealized PnL and liquidation."
          />

          <Statistic
            label={"Index"}
            value={<NumeralWithCtx>{data?.index_price}</NumeralWithCtx>}
            // value={data?.index_price}
            rule={"price"}
            hint="Average of the last prices across other exchanges."
          />
          <Statistic
            hint="24 hour total trading volume on the Orderly Network."
            label={
              <div className="orderly-flex orderly-items-center">
                <OrderlyIcon size={14} className="orderly-mr-[6px]" />
                <div>24h volume</div>
              </div>
            }
            value={
              <Numeral
                className="orderly-whitespace-nowrap"
                rule="human"
                unit={` ${quote}`}
              >
                {data?.["24h_amount"]}
              </Numeral>
            }
          />

          <MemoizedCompnent symbol={props.symbol} />
          <Statistic
            label={"Open interest"}
            value={
              <Numeral
                className="orderly-whitespace-nowrap"
                rule="human"
                unit={` ${quote}`}
              >
                {new Decimal(data?.open_interest ?? 0)
                  .mul(data?.index_price ?? 0)
                  .toDecimalPlaces(2)
                  .valueOf()}
              </Numeral>
            }
            rule={"price"}
            hint="Total size of positions per side."
          />
          <div ref={tailingElementRef} className="orderly-pr-[20px]" />
        </div>
        <TickerMask
          leading
          visible={leadingVisible}
          onClick={onScollButtonClick}
        />
        <TickerMask
          tailing
          visible={tailingVisible}
          onClick={onScollButtonClick}
        />
      </div>
    </StatisticStyleProvider>
  );
};
