import { ChainMenu } from "./chainMenu.ui";
import { useChainMenuScript } from "./chainMenu.script";

export const ChainMenuWidget = () => {
  const state = useChainMenuScript();
  return <ChainMenu {...state} />;
};
