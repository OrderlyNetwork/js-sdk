import React from "react";
import { MinimumReceivedUI } from "./minimumReceived.ui";

export const MinimumReceivedWidget: React.FC<
  Readonly<{
    minimumReceived: number;
    symbol: string;
  }>
> = (props) => {
  return <MinimumReceivedUI {...props} />;
};
