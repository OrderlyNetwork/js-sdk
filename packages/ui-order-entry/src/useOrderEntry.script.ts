import { positionActions, useMarkPriceBySymbol } from "@orderly.network/hooks";

export const useOrderEntryScript = () => {
  const markPrice = useMarkPriceBySymbol("PERP_BTC_USDC");
  const { getPositions } = positionActions();

  const { data } = getPositions();

  return {
    markPrice,
  };
};

export type uesOrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;
