import { FC } from "react";
import { useTradeStream } from "@orderly.network/hooks";
import { TradeHistory } from "@/block/tradeHistory";
interface TradeHistoryProps {
  symbol: string;
}

export const TradeHistoryPane: FC<TradeHistoryProps> = (props) => {
  const { symbol } = props;
  // console.log("---------->>>>>>", symbol);
  const { data, isLoading } = useTradeStream(symbol);
  return (
    <div className="h-[300px] overflow-y-auto p-3 ">
      <TradeHistory dataSource={data} loading={isLoading} />
    </div>
  );
};
