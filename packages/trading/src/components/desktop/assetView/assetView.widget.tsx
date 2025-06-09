import { useAssetViewScript } from "./assetView.script";
import { AssetView } from "./assetView.ui";

export const AssetViewWidget = () => {
  const state = useAssetViewScript();
  return <AssetView {...state} />;
};
