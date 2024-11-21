import React from "react";
import { MarketsFull } from "@/block/markets/markets.full";

const MyMarkets = ({ onClose }: { onClose: () => void }) => {
  // const { data } = useMarketsStream();
  // const { markets: markets } = useMarket(MarketsType.ALL);
  // console.log("markets data", data);

  return <MarketsFull maxHeight={300} onClose={onClose} />;
};

export const MemoizedMarkets = React.memo(MyMarkets);
