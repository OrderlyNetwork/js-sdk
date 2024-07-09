import { ChainMenu } from "./chainMenu.ui";
import { useChainMenuBuilderScript } from "./useWidgetBuilder.script";

export const ChainMenuWidget = () => {
  const state = useChainMenuBuilderScript();
  // @ts-ignore
  return <ChainMenu {...state} />;
};
