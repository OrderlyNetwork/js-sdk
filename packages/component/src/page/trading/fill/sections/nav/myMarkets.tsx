import React from "react";
import { MarketsFull } from "@/block/markets/markets.full";
import { useMarketsStream } from "@orderly.network/hooks";

const MyMarkets = ({ onClose }: { onClose: () => void }) => {
  const { data } = useMarketsStream();
  return <MarketsFull dataSource={data} maxHeight={300} onClose={onClose} />;
};

export const MemoizedMarkets = React.memo(MyMarkets);
