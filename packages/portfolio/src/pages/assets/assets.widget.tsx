import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { useAssetsScript, useAssetsScriptReturn } from "./assets.script";
import { AssetsTable } from "./assets.ui";

export type AssetsWidgetProps = useAssetsScriptReturn;

export const AssetsWidget: React.FC = () => {
  const state = useAssetsScript();
  const accountState = useAccount();
  return <AssetsTable {...state} {...accountState} />;
};
