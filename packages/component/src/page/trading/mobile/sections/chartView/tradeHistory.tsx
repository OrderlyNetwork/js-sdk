import { FC } from "react";
import { useMarketTradeStream } from "@orderly.network/hooks";
import { TradeHistory } from "@/block/tradeHistory";
import { SymbolProvider } from "@/provider";
interface TradeHistoryProps {
  symbol: string;
}

export const TradeHistoryPane: FC<TradeHistoryProps> = (props) => {
  const { symbol } = props;

  const { data, isLoading } = useMarketTradeStream(symbol);

  return <TradeHistory dataSource={data} loading={isLoading} />;
};
