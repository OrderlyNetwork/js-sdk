import { FC, memo } from "react";
import { SymbolProvider } from "@/provider/symbolProvider";
import { useMarketTradeStream } from "@orderly.network/hooks";
import { TradeHistory } from "@/block/tradeHistory";
import { useTabContext } from "@/tab/tabContext";

interface TradeHistoryProps {
  symbol: string;
}

export const TradeHistoryFull: FC<TradeHistoryProps> = (props) => {
  const { symbol } = props;

  const { data, isLoading } = useMarketTradeStream(symbol);
  const { height } = useTabContext();

  return (
    <div
      className="orderly-overflow-y-auto"
      style={{ height: `${height?.content}px` }}
    >
      <TradeHistory
        dataSource={data}
        loading={isLoading}
        headerClassName="orderly-py-[5px]"
      />
    </div>
  );
};

export const MemorizedTradeHistoryFull = memo(TradeHistoryFull);
