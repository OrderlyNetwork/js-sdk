import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import { useChainSelectorBuilder } from "./chainSelector.script";
import { ChainSelector } from "./chainSelector.ui";
import { NetworkId } from "@orderly.network/types";

export const ChainSelectorWidget = (props: {
  networkId?: NetworkId;
  bridgeLessOnly?: boolean;
  close?: () => void;
  resolve?: (isSuccess: boolean) => void;
  reject?: () => void;
  isWrongNetwork?: boolean;
}) => {
  const state = useChainSelectorBuilder(props);
  return (
    <ChainSelector {...state} close={props.close} resolve={props.resolve} isWrongNetwork={props.isWrongNetwork} />
  );
};

export const ChainSelectorId = "ChainSelector";
export const ChainSelectorSheetId = "ChainSelectorSheetId";

registerSimpleDialog(ChainSelectorId, ChainSelectorWidget, {
  size: "sm",
  title: "Switch Network",
});

registerSimpleSheet(ChainSelectorSheetId, ChainSelectorWidget, {
  title: "Switch Network",
})
