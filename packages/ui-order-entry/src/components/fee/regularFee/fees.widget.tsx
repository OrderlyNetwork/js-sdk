import React from "react";
import { useFeeScript } from "../fees.script";
import { RegularFeesUI } from "./fees.ui";

export const RegularFeesWidget: React.FC<
  Pick<ReturnType<typeof useFeeScript>, "takerFee" | "makerFee">
> = (props) => {
  return <RegularFeesUI {...props} />;
};
