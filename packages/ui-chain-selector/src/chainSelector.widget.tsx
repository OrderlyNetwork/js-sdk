import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import {
  useChainSelectorScript,
  UseChainSelectorScriptOptions,
} from "./chainSelector.script";
import { ChainSelector, ChainSelectorProps } from "./chainSelector.ui";

export type ChainSelectorWidgetProps = UseChainSelectorScriptOptions &
  Pick<ChainSelectorProps, "isWrongNetwork" | "size" | "className">;

export const ChainSelectorWidget = (props: ChainSelectorWidgetProps) => {
  const state = useChainSelectorScript(props);

  return (
    <ChainSelector
      {...state}
      size={props.size}
      isWrongNetwork={props.isWrongNetwork}
    />
  );
};

export const ChainSelectorDialogId = "ChainSelectorDialogId";
export const ChainSelectorSheetId = "ChainSelectorSheetId";

registerSimpleDialog(ChainSelectorDialogId, ChainSelectorWidget, {
  size: "lg",
  title: "Switch Network",
  isWrongNetwork: true,
});

registerSimpleSheet(
  ChainSelectorSheetId,
  (props) => <ChainSelectorWidget size="md" isWrongNetwork {...props} />,
  {
    title: "Switch Network",
    classNames: {
      content: "!oui-bg-base-8",
      body: "!oui-bg-base-8",
    },
  }
);
