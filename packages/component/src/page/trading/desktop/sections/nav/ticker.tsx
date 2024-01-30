import { FC, useEffect, useRef, useState } from "react";
import { Statistic } from "@/statistic";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { useTickerStream } from "@orderly.network/hooks";
import { Numeral } from "@/text";
import { MemoizedCompnent } from "./fundingRate";
import { useSymbolContext } from "@/provider/symbolProvider";
import { TickerMask } from "./tickerMask";

interface Props {
  symbol: string;
}

export const Ticker: FC<Props> = (props) => {
  const { symbol } = props;
  const data = useTickerStream(symbol);
  const [leadingVisible, setLeadingVisible] = useState(false);
  const [tailingVisible, setTailingVisible] = useState(false);

  const { base } = useSymbolContext();
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
      <div className="orderly-relative orderly-overflow-hidden">
        <div
          className="orderly-flex orderly-space-x-5 orderly-relative orderly-items-center orderly-h-full orderly-overflow-x-auto orderly-hide-scrollbar"
          ref={containerRef}
        >
          <div ref={leadingElementRef}>
            <Numeral coloring className="orderly-font-semibold">
              {data?.["24h_close"]}
            </Numeral>
          </div>
          <Statistic
            label={"24h change"}
            value={
              <div className={"orderly-flex orderly-space-x-1"}>
                {/* @ts-ignore */}
                <Numeral coloring>{data?.["24h_change"]}</Numeral>
                <span className={"orderly-text-base-contrast-54"}>/</span>
                <Numeral coloring rule={"percentages"}>
                  {/* @ts-ignore */}
                  {data?.change || 0}
                </Numeral>
              </div>
            }
          />
          <Statistic
            label={"Mark"}
            value={data?.mark_price}
            rule={"price"}
            hint="Price for the computation of unrealized PnL and liquidation."
          />
          <Statistic
            label={"Index"}
            value={data?.index_price}
            rule={"price"}
            hint="Average of the last prices across other exchanges."
          />
          <Statistic
            label={"24h volume"}
            value={<Numeral rule="human">{data?.["24h_amount"]}</Numeral>}
          />

          <MemoizedCompnent symbol={props.symbol} />
          <Statistic
            label={"Open interest"}
            value={<Numeral unit={base}>{data?.open_interest}</Numeral>}
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
