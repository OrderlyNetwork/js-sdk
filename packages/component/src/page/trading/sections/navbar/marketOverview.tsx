import { SimpleMarketOverview } from "@/block/marketOverview";
import { FC } from "react";
import { useTickerStream } from "@orderly.network/hooks";

interface Props {
  symbol: string;
}

export const MarketOverview: FC<Props> = (props) => {
  const { symbol } = props;
  const data = useTickerStream(symbol);

  return (
    <SimpleMarketOverview
      change={data?.change ?? 0}
      price={data?.["24h_close"] ?? 0}
    />
  );
};
