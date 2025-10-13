import { FC } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { VaultInfo } from "../../types/vault";
import { VaultCardWidget } from "../vault-card";

export const AllVaultsDesktop: FC<{ vaults: VaultInfo[] }> = (props) => {
  const { vaults } = props;
  const { t } = useTranslation();

  return (
    <div className="oui-flex oui-flex-col oui-gap-6">
      <div className="oui-text-xl oui-font-normal oui-text-base-contrast">
        {t("vaults.allVaults")}
      </div>
      <div className="oui-grid oui-grid-cols-3 oui-gap-4 min-[1024px]:oui-grid-cols-3">
        {vaults.map((vault) => (
          <VaultCardWidget key={vault.vault_id} vault={vault} />
        ))}
      </div>
    </div>
  );
};
