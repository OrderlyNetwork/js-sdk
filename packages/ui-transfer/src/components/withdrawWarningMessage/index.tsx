import { useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { Box, Flex } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

interface IProps {
  quantity: string;
  chainVaultBalance: number;
  currentChain: any;
  maxAmount: number;
  crossChainTrans: boolean;
  checkIsBridgeless: boolean;
}

export const WithdrawWarningMessage = ({
  checkIsBridgeless,
  quantity,
  chainVaultBalance,
  currentChain,
  maxAmount,
  crossChainTrans,
}: IProps) => {
  const { t } = useTranslation();
  const { wrongNetwork } = useAppContext();
  const { state } = useAccount();

  const networkName = useMemo(() => {
    if (currentChain && currentChain.info && currentChain.info.network_infos) {
      return currentChain.info.network_infos.name;
    }
    return undefined;
  }, [currentChain]);

  const showVaultWarning = useMemo(() => {
    if (!chainVaultBalance) {
      return false;
    }
    if (!maxAmount) {
      return false;
    }
    if (!quantity) {
      return false;
    }
    if (new Decimal(quantity).gt(maxAmount)) {
      return false;
    }
    if (new Decimal(quantity).gt(chainVaultBalance)) {
      return true;
    }
    return false;
  }, [quantity, chainVaultBalance]);

  const renderContent = () => {
    if (state.status === AccountStatusEnum.NotConnected) {
      return;
    }

    // if (wrongNetwork || !checkIsBridgeless) {
    //   return (
    //     <Box>
    //       {networkName
    //         ? t("transfer.withdraw.unsupported.networkName", { networkName })
    //         : t("transfer.withdraw.unsupported.chain")}
    //     </Box>
    //   );
    // }

    if (crossChainTrans) {
      return t("transfer.withdraw.crossChain.process");
    }
    if (showVaultWarning) {
      return t("transfer.withdraw.crossChain.vaultWarning", {
        networkName,
        chainVaultBalance,
      });
    }
  };

  const content = renderContent();

  if (content) {
    return (
      <Flex
        className="oui-text-warning-darken oui-text-xs oui-justify-center oui-text-center"
        mb={3}
      >
        {content}
      </Flex>
    );
  }

  return null;
};
