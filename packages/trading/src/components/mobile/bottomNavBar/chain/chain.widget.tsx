import { useChainScript } from "./chain.script";
import { Chain } from "./chain.ui";

export const ChainWidget = () => {
    const state = useChainScript();
    return (<Chain {...state} />);
};
