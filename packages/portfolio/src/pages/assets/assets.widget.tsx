import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";
import { useAssetsScript } from "./assets.script";
import type { useAssetsScriptReturn } from "./assets.script";
import { AssetsTable } from "./assets.ui";
import { AssetsTableMobile } from "./assets.ui.mobile";

export type AssetsWidgetProps = useAssetsScriptReturn;

export const AssetsWidget: React.FC = () => {
  const assetsState = useAssetsScript();
  const accountState = useAccount();
  const { isMobile } = useScreen();
  if (isMobile) {
    return <AssetsTableMobile {...assetsState} {...accountState} />;
  }
  return <AssetsTable {...assetsState} {...accountState} />;
};
