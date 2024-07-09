import { useState } from "react";
import { DateRange } from "../../../utils/types";

export type RebatesReturns = {
  dateRange?: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
};

export const useRebatesScript = (): RebatesReturns => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  return {
    dateRange,
    setDateRange,
  };
};
