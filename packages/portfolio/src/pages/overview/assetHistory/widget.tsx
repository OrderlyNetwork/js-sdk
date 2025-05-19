import { useScreen } from "@orderly.network/ui";
import { useAssetScript } from "../assets";
import { AssetHistory } from "./dataTable.ui";
import { AssetHistoryMobile } from "./dataTable.ui.mobile";
import { useAssetHistoryHook } from "./useDataSource.script";

export const AssetHistoryWidget = () => {
  const state = useAssetHistoryHook();
  const { onDeposit } = useAssetScript();

  const { isMobile } = useScreen();
  if (isMobile) {
    return <AssetHistoryMobile {...state} onDeposit={onDeposit} />;
  }
  return <AssetHistory {...state} />;
};
