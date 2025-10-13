import { useCallback } from "react";
import { useFundingRate } from "@kodiak-finance/orderly-hooks";
import { modal } from "@kodiak-finance/orderly-ui";
import { FundingRateDialogId } from "../fundingRateModal/fundingRateModal.widget";

export const useFundingRateScript = (symbol: string) => {
  const data = useFundingRate(symbol);
  const onClick = useCallback<React.MouseEventHandler<HTMLElement>>(() => {
    modal.show(FundingRateDialogId, { symbol });
  }, [symbol]);
  return {
    data,
    onClick,
  };
};

export type FundingRateState = ReturnType<typeof useFundingRateScript>;
