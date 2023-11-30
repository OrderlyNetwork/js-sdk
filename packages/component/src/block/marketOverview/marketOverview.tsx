import { FC, useMemo } from "react";
import { MarketPrice, type MarketPriceProps } from "./marketPrice";
import { FundingRate, type FundingRateProps } from "./fundingRate";

export type MarketItem = "price" | "fundingRate";
//   | "openInterest"
//   | "volume"
//   | "trades";

export interface MarketOverviewProps {
  items?: Partial<{ [key in MarketItem]: MarketPriceProps | FundingRateProps }>;
}

const MarketOverviewItem: Record<MarketItem, FC<any>> = {
  price: MarketPrice,
  fundingRate: FundingRate,
};

export const MarketOverview: FC<MarketOverviewProps> = ({ items }) => {
  const children = useMemo(() => {
    if (!items) return null;

    return Object.keys(items).map((key) => {
      const item = key as MarketItem;
      const Comp = MarketOverviewItem[item];
      if (!Comp) return null;
      return <Comp {...items[item]} key={item} />;
    });
  }, [items]);

  return <div className="orderly-flex orderly-gap-5">{children}</div>;
};
