import { OrderBook } from "@orderly.network/react";

export const OrderBookComponent = () => {
  return (
    <OrderBook
      asks={[]}
      bids={[]}
      markPrice={1}
      lastPrice={[1]}
      depth={[0.0001, 0.001, 0.01, 0.1]}
      activeDepth={0}
      base={""}
      quote={""}
    />
  );
};
