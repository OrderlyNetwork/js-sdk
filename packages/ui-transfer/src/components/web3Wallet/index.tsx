import { FC, useMemo } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { ABSTRACT_CHAIN_ID_MAP } from "@orderly.network/types";
import { Flex, Text, WalletIcon } from "@orderly.network/ui";
import { formatAddress } from "../../utils";

export const Web3Wallet: FC = () => {
  const { t } = useTranslation();
  const { wallet, connectedChain } = useWalletConnector();
  const { state: accountState, account } = useAccount();

  const { walletName, address } = useMemo(() => {
    let address = accountState.address;
    if (
      connectedChain?.id &&
      ABSTRACT_CHAIN_ID_MAP.has(parseInt(connectedChain?.id as string))
    ) {
      address = account.getAdditionalInfo()?.AGWAddress;
    }
    return {
      walletName: wallet?.label,
      address: formatAddress(address),
    };
  }, [wallet, accountState, account, connectedChain]);

  return (
    <Flex justify="between">
      <Text size="sm" intensity={98}>
        {t("transfer.web3Wallet")}
      </Text>

      <Flex gapX={1}>
        <WalletIcon size={"xs"} name={walletName ?? ""} />
        <Text size="sm" intensity={54}>
          {address}
        </Text>
      </Flex>
    </Flex>
  );
};
