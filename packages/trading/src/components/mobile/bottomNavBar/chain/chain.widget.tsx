import React from "react";
import { useChainScript } from "./chain.script";
import { Chain } from "./chain.ui";

export const ChainWidget: React.FC = () => {
  const state = useChainScript();
  return <Chain {...state} />;
};
