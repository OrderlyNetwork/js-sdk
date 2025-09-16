import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";
import { useAssetsScript } from "./assets.script";
import type { useAssetsScriptReturn } from "./assets.script";
import { AssetsDataTable, AssetsTable } from "./assets.ui.desktop";
import { AssetsTableMobile } from "./assets.ui.mobile";

export type AssetsWidgetProps = useAssetsScriptReturn;

export const AssetsDataTableWidget: React.FC = () => {
  const assetsState = useAssetsScript();
  const accountState = useAccount();
  return <AssetsDataTable {...assetsState} {...accountState} />;
};

export const AssetsWidget: React.FC = () => {
  const assetsState = useAssetsScript();
  const accountState = useAccount();
  const { isMobile } = useScreen();
  if (isMobile) {
    return <AssetsTableMobile {...assetsState} {...accountState} />;
  }
  return <AssetsTable {...assetsState} {...accountState} />;
};
