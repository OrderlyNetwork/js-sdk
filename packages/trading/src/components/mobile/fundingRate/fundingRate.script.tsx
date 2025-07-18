import { useCallback } from "react";
import { useFundingRate } from "@orderly.network/hooks";
import { modal } from "@orderly.network/ui";
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
