import React from "react";
import { MarketsFull } from "@/block/markets/markets.full";
import { useMarketsStream, useMarkets, MarketsType } from "@orderly.network/hooks";

const MyMarkets = ({ onClose }: { onClose: () => void }) => {
  // const { data } = useMarketsStream();
  // const { markets: markets } = useMarkets(MarketsType.ALL);
  // console.log("markets data", data);
  
  return <MarketsFull maxHeight={300} onClose={onClose} />;
};

export const MemoizedMarkets = React.memo(MyMarkets);
