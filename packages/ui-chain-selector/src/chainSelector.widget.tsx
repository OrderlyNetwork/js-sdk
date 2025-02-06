import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import {
  useChainSelectorScript,
  UseChainSelectorScriptOptions,
} from "./chainSelector.script";
import { ChainSelector, ChainSelectorProps } from "./chainSelector.ui";

export type ChainSelectorWidgetProps = UseChainSelectorScriptOptions &
  Pick<ChainSelectorProps, "isWrongNetwork" | "variant" | "className">;

export const ChainSelectorWidget = (props: ChainSelectorWidgetProps) => {
  const state = useChainSelectorScript(props);

  return (
    <ChainSelector
      {...state}
      variant={props.variant}
      isWrongNetwork={props.isWrongNetwork}
    />
  );
};

export const ChainSelectorDialogId = "ChainSelectorDialogId";
export const ChainSelectorSheetId = "ChainSelectorSheetId";

registerSimpleDialog(ChainSelectorDialogId, ChainSelectorWidget, {
  size: "lg",
  title: "Switch Network",
  variant: "wide",
  isWrongNetwork: true,
});

registerSimpleSheet(ChainSelectorSheetId, ChainSelectorWidget, {
  title: "Switch Network",
  classNames: {
    content: "!oui-bg-base-8",
    body: "!oui-bg-base-8",
  },
  variant: "compact",
  isWrongNetwork: true,
});
