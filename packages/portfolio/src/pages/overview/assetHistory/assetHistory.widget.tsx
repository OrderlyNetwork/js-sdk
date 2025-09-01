import React from "react";
import { AssetHistorySideEnum } from "@orderly.network/types";
import { useScreen } from "@orderly.network/ui";
import { useAssetHistoryScript } from "./assetHistory.script";
import { AssetHistory } from "./assetHistory.ui";
import { AssetHistoryMobile } from "./assetHistory.ui.mobile";

type AssetHistoryWidgetProps = {
  side: AssetHistorySideEnum;
};

export const AssetHistoryWidget: React.FC<AssetHistoryWidgetProps> = (
  props,
) => {
  const state = useAssetHistoryScript({ side: props.side });
  const { isMobile } = useScreen();
  if (isMobile) {
    return <AssetHistoryMobile {...state} />;
  }
  return <AssetHistory {...state} />;
};
