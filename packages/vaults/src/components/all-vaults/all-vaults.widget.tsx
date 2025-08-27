import { FC } from "react";
import { useScreen } from "@orderly.network/ui";
import { useVaultInfoState } from "../../store/vaultsStore";
import { AllVaultsDesktop } from "./all-vaults.desktop";
import { AllVaultsMobile } from "./all-vaults.mobile";

export const AllVaultsWidget: FC = () => {
  const vaultsInfo = useVaultInfoState().data;
  const { isMobile } = useScreen();

  return isMobile ? (
    <AllVaultsMobile vaults={vaultsInfo} />
  ) : (
    <AllVaultsDesktop vaults={vaultsInfo} />
  );
};
