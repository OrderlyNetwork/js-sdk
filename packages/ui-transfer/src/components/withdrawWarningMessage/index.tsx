/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";
import { Flex } from "@orderly.network/ui";

interface WarningMessageProps {
  chainVaultBalance: number;
  currentChain: any;
  crossChainTrans: boolean;
  checkIsBridgeless: boolean;
  tokenName: string;
  qtyGreaterThanVault: boolean;
}

export const WithdrawWarningMessage: React.FC<WarningMessageProps> = (
  props,
) => {
  const {
    chainVaultBalance,
    currentChain,
    crossChainTrans,
    tokenName,
    qtyGreaterThanVault,
  } = props;
  const { t } = useTranslation();
  const { state } = useAccount();

  const chainName = useMemo(() => {
    if (currentChain && currentChain.info && currentChain.info.network_infos) {
      return currentChain.info.network_infos.name;
    }
    return undefined;
  }, [currentChain]);

  const renderContent = () => {
    if (state.status === AccountStatusEnum.NotConnected) {
      return "";
    }
    if (crossChainTrans) {
      return t("transfer.withdraw.crossChain.process");
    }
    if (qtyGreaterThanVault) {
      return t("transfer.withdraw.vaultWarning", {
        tokenName: tokenName,
        chainName: chainName,
        balance: chainVaultBalance,
      });
    }
  };

  const content = renderContent();

  if (content) {
    return (
      <Flex
        my={4}
        className="oui-justify-center oui-text-center oui-text-xs oui-text-warning-darken"
      >
        {content}
      </Flex>
    );
  }

  return null;
};
