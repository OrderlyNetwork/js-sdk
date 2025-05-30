import React, { useMemo } from "react";
import { useStorageChain } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  AbstractChains,
  ChainNamespace,
  SolanaChains,
} from "@orderly.network/types";
import { ExclamationFillIcon } from "@orderly.network/ui";
import { WalletType } from "../types";

export function SwitchNetworkTips({
  tipsContent,
}: {
  tipsContent: string | null;
}) {
  const { t } = useTranslation();
  if (!tipsContent) {
    return null;
  }
  return (
    <div className="oui-flex oui-mb-3 oui-items-center oui-gap-1  oui-px-2 oui-py-[6px] oui-bg-[rgba(255,125,0,0.1)] oui-rounded-[8px] ">
      <ExclamationFillIcon
        size={14}
        className=" oui-text-warning-darken oui-flex-shrink-0"
      />
      <div className="oui-text-2xs oui-text-warning-darken">
        {t("connector.privy.switchNetwork.tips", {
          chainName: tipsContent,
        })}
      </div>
    </div>
  );
}
export const StorageChainNotCurrentWalletType = ({
  currentWalletType,
}: {
  currentWalletType: Set<WalletType>;
}) => {
  const { storageChain } = useStorageChain();
  const tipsContent = useMemo(() => {
    if (!currentWalletType || currentWalletType.size === 0 || !storageChain) {
      return null;
    }
    let text = null;
    const isSolana = SolanaChains.has(parseInt(storageChain?.chainId));
    const isAbstract = AbstractChains.has(parseInt(storageChain?.chainId));
    const isEvm = !isSolana && !isAbstract;

    if (isSolana && currentWalletType.has(WalletType.SOL)) {
      return null;
    } else if (isAbstract && currentWalletType.has(WalletType.ABSTRACT)) {
      return null;
    } else if (isEvm && currentWalletType.has(WalletType.EVM)) {
      return null;
    }

    text = Array.from(currentWalletType)
      .map((item) => {
        if (item === WalletType.EVM) {
          return "Evm";
        } else if (item === WalletType.SOL) {
          return "Solana";
        } else if (item === WalletType.ABSTRACT) {
          return "Abstract";
        }
      })
      .join("/");
    return text;
  }, [storageChain, currentWalletType]);

  return <SwitchNetworkTips tipsContent={tipsContent} />;
};
