import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { useAssetsScript, useAssetsScriptReturn } from "./assets.script";
import { AssetsTable } from "./assets.ui";
import { useConvertScript } from "./convert.script";

export type AssetsWidgetProps = useAssetsScriptReturn & {
  convertState: ReturnType<typeof useConvertScript>;
};

export const AssetsWidget: React.FC = () => {
  const state = useAssetsScript();
  const convertState = useConvertScript();
  const accountState = useAccount();
  return (
    <AssetsTable {...state} {...accountState} convertState={convertState} />
  );
};
