import { useDemoContext } from "@/components/demoContext";
import { useMarketTradeStream } from "@orderly.network/hooks";
import { TradeHistory } from "@orderly.network/react";

export const TradeHistoryComponent = () => {
  const { symbol } = useDemoContext();
  const { data, isLoading } = useMarketTradeStream(symbol, { limit: 20 });
  return <TradeHistory dataSource={data} loading={isLoading} />;
};
