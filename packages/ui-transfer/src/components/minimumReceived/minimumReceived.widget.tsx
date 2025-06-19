import React from "react";
import { useMinimumReceivedScript } from "./minimumReceived.script";
import { MinimumReceivedUI } from "./minimumReceived.ui";

export const MinimumReceivedWidget: React.FC = () => {
  const state = useMinimumReceivedScript();
  return <MinimumReceivedUI {...state} />;
};
