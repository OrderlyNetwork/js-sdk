import { FC } from "react";
import { VaultsHeaderDesktop } from "./vaults-header.desktop";
import { useVaultsHeaderScript } from "./vaults-header.script";

export const VaultsHeaderWidget: FC = () => {
  const state = useVaultsHeaderScript();

  return <VaultsHeaderDesktop {...state} />;
};
