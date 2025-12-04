import { API } from "@veltodefi/types";

export const useLiquidationCellScript = (props: {
  item: API.Liquidation & {
    formatted_account_mmr: string;
    liquidationFeeRate: number;
  };
  onSymbolChange?: (symbol: API.Symbol) => void;
  index: number;
}) => {
  return {
    ...props,
  };
};

export type LiquidationCellState = ReturnType<typeof useLiquidationCellScript>;
