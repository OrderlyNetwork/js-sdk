import { ChainMenu } from "./chainMenu.ui";
import { useChainMenuBuilderScript } from "./useWidgetBuilder.script";

export const ChainMenuWidget = () => {
  const state = useChainMenuBuilderScript();
  return <ChainMenu {...state} />;
};
