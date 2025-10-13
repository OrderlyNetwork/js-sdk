import React from "react";
import { useFeeState } from "@kodiak-finance/orderly-hooks";
import { RegularFeesUI } from "./regularFees.ui";

export const RegularFeesWidget: React.FC<
  Pick<ReturnType<typeof useFeeState>, "takerFee" | "makerFee">
> = (props) => {
  return <RegularFeesUI {...props} />;
};
