import { useOrderbook } from "@orderly/hooks";
import { useState } from "react";

export const WooPage = () => {
  const [pair, setPair] = useState("PERP_BTC_USDC"); // ["BTC/USD","ETH/USD"
  const orderbook = useOrderbook(pair);

  return (
    <div className="flex gap-2">
      <button onClick={() => setPair("PERP_BTC_USDC")}>BTC/USDC</button>
      <button onClick={() => setPair("PERP_ETH_USDC")}>ETH/USDC</button>
      <button onClick={() => setPair("PERP_NEAR_USDC")}>NEAR/USDC</button>
    </div>
  );
};
