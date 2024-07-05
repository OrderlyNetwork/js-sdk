import { useState } from "react";

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};
export type CommissionAndRefereesReturns = {
  commissionRange?: DateRange;
  setCommissionRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  refereesRange?: DateRange;
  setRefereesRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
};

export const useCommissionAndRefereesScript =
  (): CommissionAndRefereesReturns => {
    const [commissionRange, setCommissionRange] = useState<
      DateRange | undefined
    >();
    const [refereesRange, setRefereesRange] = useState<DateRange | undefined>();
    return {
      commissionRange,
      setCommissionRange,
      refereesRange,
      setRefereesRange,
    };
  };
