import { FC, useMemo } from "react";
import { useAccount, useWalletConnector } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { ABSTRACT_CHAIN_ID_MAP } from "@kodiak-finance/orderly-types";
import { Flex, Text, WalletIcon } from "@kodiak-finance/orderly-ui";

export const Web3Wallet: FC = () => {
  const { t } = useTranslation();
  const { wallet, connectedChain } = useWalletConnector();
  const { state: accountState, account } = useAccount();

  const address = useMemo(() => {
    let address = accountState.address;
    if (
      connectedChain?.id &&
      ABSTRACT_CHAIN_ID_MAP.has(parseInt(connectedChain?.id as string))
    ) {
      address = account.getAdditionalInfo()?.AGWAddress;
    }

    return address;
  }, [wallet, accountState, account, connectedChain]);

  return (
    <Flex justify="between">
      <Text size="sm" intensity={98}>
        {t("transfer.web3Wallet.your")}
      </Text>

      <Flex gapX={1}>
        <WalletIcon size={"xs"} name={wallet?.label ?? ""} />
        <Text.formatted size="sm" intensity={54} rule="address">
          {address}
        </Text.formatted>
      </Flex>
    </Flex>
  );
};
