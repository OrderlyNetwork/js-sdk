import { AssetHistory } from "./dataTable.ui";
import { useAssetHistoryHook } from "./useScript";

export const AssetHistoryWidget = () => {
  const state = useAssetHistoryHook();
  return <AssetHistory {...state} />;
};
