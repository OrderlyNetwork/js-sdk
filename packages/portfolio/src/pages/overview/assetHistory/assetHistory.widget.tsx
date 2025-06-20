import { useScreen } from "@orderly.network/ui";
import {
  AssetSide,
  useAssetHistoryScript,
} from "../assetChart/assetHistory.script";
import { AssetHistory } from "./assetHistory.ui";
import { AssetHistoryMobile } from "./assetHistory.ui.mobile";

type AssetHistoryWidgetProps = {
  side: AssetSide;
};

export const AssetHistoryWidget = (props: AssetHistoryWidgetProps) => {
  const state = useAssetHistoryScript({ side: props.side });

  const { isMobile } = useScreen();
  if (isMobile) {
    return <AssetHistoryMobile {...state} />;
  }
  return <AssetHistory {...state} />;
};
