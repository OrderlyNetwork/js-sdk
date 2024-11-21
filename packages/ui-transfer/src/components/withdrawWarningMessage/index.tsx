import { Box, Flex } from "@orderly.network/ui";
import { useAppContext } from "@orderly.network/react-app";
import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import { AccountStatusEnum } from "@orderly.network/types";
import { useAccount } from "@orderly.network/hooks";

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

    if (wrongNetwork || !checkIsBridgeless) {
      return (
        <Box>
          Withdrawals are not supported on {networkName ?? "this chain"}. Please
          switch to any of the bridgeless networks.
        </Box>
      );
    }
    if (crossChainTrans) {
      return `Your cross-chain withdrawal is being processed...`;
    }
    if (showVaultWarning) {
      return `Withdrawal exceeds the balance of the ${networkName} vault ( ${chainVaultBalance} USDC ). Cross-chain rebalancing fee will be charged for withdrawal to ${networkName}.`;
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
