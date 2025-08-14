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
  qtyGreaterThanMaxAmount: boolean;
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
    qtyGreaterThanMaxAmount,
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
      return null;
    }
    if (crossChainTrans) {
      return t("transfer.withdraw.crossChain.process");
    }
    if (qtyGreaterThanMaxAmount) {
      return t("transfer.insufficientBalance");
    }
    if (qtyGreaterThanVault) {
      return t("transfer.withdraw.vaultWarning", {
        tokenName: tokenName,
        chainName: chainName,
        balance: chainVaultBalance,
      });
    }
    return null;
  };

  const content = renderContent();

  if (!content) {
    return null;
  }

  return (
    <Flex
      my={4}
      className="oui-justify-center oui-text-center oui-text-xs oui-text-warning-darken"
    >
      {content}
    </Flex>
  );
};
