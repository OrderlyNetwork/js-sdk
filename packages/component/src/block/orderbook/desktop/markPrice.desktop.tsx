import { SymbolContext } from "@/provider";
import { Numeral } from "@/text";
import { cn } from "@/utils/css";
import { Flag } from "lucide-react";
import { FC, SVGProps, useContext, useEffect, useMemo, useRef } from "react";
import { Decimal } from "@orderly.network/utils";
import { Tooltip } from "@/tooltip";

interface DesktopMarkPriceProps {
  markPrice: number;
  lastPrice: number[];
  asks: number[][],
  bids: number[][],
}

export const DesktopMarkPrice: FC<DesktopMarkPriceProps> = (props) => {
  const { markPrice = 0, lastPrice, asks, bids } = props;

  return (
    <div
      
      className="orderly-py-1 orderly-flex orderly-justify-between orderly-text-xs orderly-text-base-contrast-80 desktop:orderly-h-[40px] desktop:orderly-text-[20px] desktop:orderly-justify-between orderly-tabular-nums"
    >
      <div className="orderly-flex orderly-flex-1 orderly-flex-row orderly-gap-2">
        <Price markPrice={markPrice} lastPrice={lastPrice} />
        <MarkPrice markPrice={markPrice} />
      </div>
      <Spread asks={asks} bids={bids} />
    </div>
  );
};


const Price: FC<{
  markPrice: number;
  lastPrice: number[];
}> = (props) => {

  const { markPrice = 0, lastPrice, } = props;

  const { quote_dp } = useContext(SymbolContext);

  const [prevLastPrice, middlePrice] = lastPrice;

  return (
    <div
      className={cn(
        "orderly-text-lg orderly-flex orderly-items-center desktop:orderly-font-normal",
        {
          "orderly-text-trade-profit": middlePrice > prevLastPrice,
          "orderly-text-trade-loss": middlePrice < prevLastPrice,
        }
      )}
    >
      <Numeral className="orderly-font-bold" precision={quote_dp}>{middlePrice}</Numeral>
      <ArrowTopIcon
          size={12}
          className={cn("orderly-ml-1", {
            "orderly-rotate-180": middlePrice < prevLastPrice,
            "orderly-fill-trade-profit": middlePrice > prevLastPrice,
            "orderly-fill-trade-loss": middlePrice < prevLastPrice,
            "orderly-fill-transparent": middlePrice === prevLastPrice
          })}
        />
    </div>
  );
}

const MarkPrice: FC<{
  markPrice: number;
}> = (props) => {


  const { quote_dp } = useContext(SymbolContext);

  return (
    <Tooltip content={"Obtained from a third-party oracle, the mark price is calculated as the median of three prices: the last price, the fair price based on the funding rate basis, and the fair price based on the order books."} className="orderly-max-w-[270px]">
      <div
      className="orderly-flex orderly-items-center orderly-text-3xs desktop:orderly-text-2xs orderly-cursor-pointer"
    >
      {/* @ts-ignore */}
      <Flag size={14} className="orderly-text-yellow-400" />
      <Numeral
        precision={quote_dp}
        className="desktop:orderly-text-base-contrast-54"
      >
        {props.markPrice}
      </Numeral>
    </div>
    </Tooltip>
  );
}

const Spread: FC<{
  asks: number[][],
  bids: number[][],
}> = (props) => {

  const { asks, bids } = props;

  const spread = useMemo(() => {
    if (bids.length === 0 && asks.length === 0) {
      return 0;
    }
    const bid1 = Number.isNaN(bids[0][0]) ? 0 : bids[0][0];
    const index = asks.reverse().findIndex((item) => !Number.isNaN(item[0]));

    let ask1 = 0.0;
    if (index !== -1) {
      ask1 = Number.isNaN(asks[index][0]) ? 0 : asks[index][0];
    }

    const dValue = new Decimal(ask1).sub(bid1).div(new Decimal(ask1).add(bid1).div(2));
    return Math.ceil(dValue.toNumber()) / 10000;
  }, [asks, bids]);

  return (
    <div>
      <Tooltip content={"Spread Ratio of the ask1 and bid1."} className="orderly-max-w-[240px]">
        <div className={"orderly-text-3xs orderly-text-base-contrast-36 orderly-items-center orderly-h-full orderly-flex orderly-pr-3 orderly-cursor-pointer"}>
          {`${spread}%`}
        </div>
      </Tooltip>
    </div>
  );
};



interface IconProps extends SVGProps<SVGSVGElement> {
  size: number;
}
const ArrowTopIcon: FC<IconProps> = (props) => {
  const { size = 12, viewBox, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      fill="current"
      fillOpacity={1}
      viewBox={`0 0 11.68 12.3`}
      {...rest}
    >
      <path d="M12.3058 6.58699L13.1514 5.63574L7.42409 0.544834L7.00132 0.161367L6.57854 0.544834L0.851268 5.63574L1.69682 6.58699L6.36496 2.43753L6.36496 11.8386L7.63769 11.8386L7.63769 2.43755L12.3058 6.58699Z" />
    </svg>
  );
};
