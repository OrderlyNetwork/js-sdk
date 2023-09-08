import { FC } from "react";
import { useMarketTradeStream } from "@orderly.network/hooks";
import { TradeHistory } from "@/block/tradeHistory";
interface TradeHistoryProps {
  symbol: string;
}

export const TradeHistoryPane: FC<TradeHistoryProps> = (props) => {
  const { symbol } = props;
  // console.log("---------->>>>>>", symbol);
  const { data, isLoading } = useMarketTradeStream(symbol);
  return (
    <div className="h-[300px] overflow-y-auto">
      <TradeHistory dataSource={data} loading={isLoading} />
    </div>
  );
};
