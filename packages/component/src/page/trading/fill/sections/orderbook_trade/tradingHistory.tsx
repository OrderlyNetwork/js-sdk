import { FC } from "react";
import { SymbolProvider } from "@/provider/symbolProvider";
import { useMarketTradeStream } from "@orderly.network/hooks";
import { TradeHistory } from "@/block/tradeHistory";

interface TradeHistoryProps {
  symbol: string;
}

export const TradeHistoryFull: FC<TradeHistoryProps> = (props) => {
  const { symbol } = props;

  const { data, isLoading } = useMarketTradeStream(symbol);

  return (
    <SymbolProvider symbol={symbol}>
      <TradeHistory dataSource={data} loading={isLoading} />
    </SymbolProvider>
  );
};
