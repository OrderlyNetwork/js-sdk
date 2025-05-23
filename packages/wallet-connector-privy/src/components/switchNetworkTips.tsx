import React from "react";
import { useStorageChain } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { ChainNamespace } from "@orderly.network/types";
import { ExclamationFillIcon } from "@orderly.network/ui";

export function SwitchNetworkTips({
  chainNamespace,
}: {
  chainNamespace: ChainNamespace;
}) {
  const { t } = useTranslation();
  const getChainName = () => {
    if (chainNamespace === ChainNamespace.evm) {
      return "Evm";
    }
    return "Solana";
  };
  return (
    <div className="oui-flex oui-mb-3 oui-items-center oui-gap-1  oui-px-2 oui-py-[6px] oui-bg-[rgba(255,125,0,0.1)] oui-rounded-[8px] ">
      <ExclamationFillIcon
        size={14}
        className=" oui-text-warning-darken oui-flex-shrink-0"
      />
      <div className="oui-text-2xs oui-text-warning-darken">
        {t("connector.privy.switchNetwork.tips", {
          chainName: getChainName(),
        })}
      </div>
    </div>
  );
}
export const StorageChainNotCurrentWalletType = ({
  currentWalletChainType,
}: {
  currentWalletChainType: ChainNamespace | null;
}) => {
  const { storageChain } = useStorageChain();
  if (currentWalletChainType === storageChain?.namespace) {
    return null;
  }
  if (storageChain?.namespace === ChainNamespace.evm) {
    return <SwitchNetworkTips chainNamespace={ChainNamespace.solana} />;
  }
  return <SwitchNetworkTips chainNamespace={ChainNamespace.evm} />;
};
