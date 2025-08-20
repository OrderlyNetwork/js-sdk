import { FC } from "react";
import { useVaultInfoState } from "../../store/vaultsStore";
import { AllVaultsDesktop } from "./all-vaults.desktop";

export const AllVaultsWidget: FC = () => {
  const vaultsInfo = useVaultInfoState().data;

  return <AllVaultsDesktop vaults={vaultsInfo} />;
};
