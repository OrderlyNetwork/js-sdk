import React from "react";
import { MinimumReceivedUI } from "./minimumReceived.ui";

export const MinimumReceivedWidget: React.FC<
  Readonly<{ symbol: string; minimumReceived: number | string }>
> = (props) => {
  return <MinimumReceivedUI {...props} />;
};
