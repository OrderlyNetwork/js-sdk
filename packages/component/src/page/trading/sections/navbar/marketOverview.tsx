import { SimpleMarketOverview } from "@/block/marketOverview";
import { FC } from "react";
import { useTickerStream } from "@orderly.network/hooks";
import { SymbolProvider } from "@/provider";

interface Props {
  symbol: string;
}

export const MarketOverview: FC<Props> = (props) => {
  const { symbol } = props;
  const data = useTickerStream(symbol);

  console.log("data", data?.symbol, data?.["24h_close"]);

  return (
    <SymbolProvider symbol={symbol}>
      <SimpleMarketOverview
        change={data?.change ?? 0}
        price={data?.["24h_close"] ?? 0}
      />
    </SymbolProvider>
  );
};
