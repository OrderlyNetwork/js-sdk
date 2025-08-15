import { FC } from "react";
import { VaultInfo } from "../../types/vault";
import { VaultCardWidget } from "../vault-card";

export const AllVaultsDesktop: FC<{ vaults: VaultInfo[] }> = (props) => {
  const { vaults } = props;

  return (
    <div className="oui-grid oui-grid-cols-3 oui-gap-4 min-[1024px]:oui-grid-cols-3">
      {vaults.map((vault) => (
        <VaultCardWidget key={vault.vault_id} vault={vault} />
      ))}
    </div>
  );
};
