import { AssetHistory } from "./dataTable.ui";
import { useAssetHistoryHook } from "./useDataSource.script";
import { useScreen } from "@orderly.network/ui";
import { AssetHistoryMobile } from "./dataTable.ui.mobile";

export const AssetHistoryWidget = () => {
  const state = useAssetHistoryHook();
  const { isMobile } = useScreen();
  if (isMobile) {
    return <AssetHistoryMobile {...state} />;
  }
  return <AssetHistory {...state} />;
};
