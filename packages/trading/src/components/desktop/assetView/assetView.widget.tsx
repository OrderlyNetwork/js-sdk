import { useAssetViewScript } from "./assetView.script";
import { AssetView } from "./assetView.ui";
import { FaucetState } from "./faucet/faucet.script";

export const AssetViewWidget = () => {
    const state = useAssetViewScript();
    return (<AssetView {...state} />);
};
