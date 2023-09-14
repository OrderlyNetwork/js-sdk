import { FC } from "react";
import { useMarketTradeStream } from "@orderly.network/hooks";
import { TradeHistory } from "@/block/tradeHistory";
import { SymbolProvider } from "@/provider";
interface TradeHistoryProps {
  symbol: string;
}

export const TradeHistoryPane: FC<TradeHistoryProps> = (props) => {
  const { symbol } = props;
  // console.log("---------->>>>>>", symbol);
  const { data, isLoading } = useMarketTradeStream(symbol);

  return (
    <div className="h-[280px] overflow-y-auto">
      <SymbolProvider symbol={symbol}>
        <TradeHistory dataSource={data} loading={isLoading} />
      </SymbolProvider>
    </div>
  );
};
