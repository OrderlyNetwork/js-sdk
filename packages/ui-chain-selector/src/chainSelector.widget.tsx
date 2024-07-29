import { registerSimpleDialog } from "@orderly.network/ui";
import { useChainSelectorBuilder } from "./chainSelector.script";
import { ChainSelector } from "./chainSelector.ui";

export const ChainSelectorWidget = (props: { close?: () => void }) => {
  const state = useChainSelectorBuilder();
  return <ChainSelector {...state} close={props.close} />;
};

export const ChainSelectorId = "ChainSelector";

registerSimpleDialog(ChainSelectorId, ChainSelectorWidget, {
  size: "md",
  title: "Switch Network",
});
