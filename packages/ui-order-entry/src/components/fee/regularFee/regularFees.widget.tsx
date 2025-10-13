import React from "react";
import { useFeeState } from "@orderly.network/hooks";
import { RegularFeesUI } from "./regularFees.ui";

export const RegularFeesWidget: React.FC<{ taker: string; maker: string }> = (
  props,
) => {
  return <RegularFeesUI {...props} />;
};
