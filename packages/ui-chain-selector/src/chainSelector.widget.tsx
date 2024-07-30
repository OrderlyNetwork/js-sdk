import { registerSimpleDialog } from "@orderly.network/ui";
import { useChainSelectorBuilder } from "./chainSelector.script";
import { ChainSelector } from "./chainSelector.ui";
import { NetworkId } from "@orderly.network/types";

export const ChainSelectorWidget = (props: {
  networkId?: NetworkId;
  close?: () => void;
}) => {
  const state = useChainSelectorBuilder(props);
  return <ChainSelector {...state} close={props.close} />;
};

export const ChainSelectorId = "ChainSelector";

registerSimpleDialog(ChainSelectorId, ChainSelectorWidget, {
  size: "md",
  title: "Switch Network",
});