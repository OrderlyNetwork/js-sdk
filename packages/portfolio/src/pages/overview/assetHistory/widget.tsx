import { AssetHistory } from "./dataTable.ui";
import { useAssetHistoryHook } from "./useDataSource.script";

export const AssetHistoryWidget = () => {
  const state = useAssetHistoryHook();
  return <AssetHistory {...state} />;
};
