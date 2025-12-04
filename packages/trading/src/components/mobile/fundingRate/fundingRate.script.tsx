import { useCallback } from "react";
import { useFundingRate } from "@veltodefi/hooks";
import { modal } from "@veltodefi/ui";
import { FundingRateSheetId } from "../fundingRateModal/fundingRateModal.widget";

export const useFundingRateScript = (symbol: string) => {
  const data = useFundingRate(symbol);
  const onClick = useCallback<React.MouseEventHandler<HTMLElement>>(() => {
    modal.show(FundingRateSheetId, { symbol });
  }, [symbol]);
  return {
    data,
    onClick,
  };
};

export type FundingRateState = ReturnType<typeof useFundingRateScript>;
