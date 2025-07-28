import { useAssetViewScript } from "./assetView.script";
import { AssetView } from "./assetView.ui";

type AssetViewWidgetProps = {
  isFirstTimeDeposit?: boolean;
};

export const AssetViewWidget = (props: AssetViewWidgetProps) => {
  const state = useAssetViewScript();
  return <AssetView {...state} isFirstTimeDeposit={props.isFirstTimeDeposit} />;
};
