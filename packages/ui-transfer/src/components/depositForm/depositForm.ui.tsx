import { FC } from "react";
import { UseDepositFormScriptReturn } from "./depositForm.script";
import {
  Box,
  Flex,
  textVariants,
  WalletIcon,
  Button,
} from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { TokenInput } from "../tokenInput";
import { NetworkSelect } from "../networkSelect";
import { ExchangeDivider } from "../exchangeDivider";
import { Web3Wallet } from "../web3Wallet";
import { BrokerWallet } from "../brokerWallet";
import { AvailableQuantity } from "../availableQuantity";
import { CoinExchange } from "../coinExchange";
import { Fee } from "../fee";

export const DepositForm: FC<UseDepositFormScriptReturn> = (props) => {
  const {
    walletName,
    address,
    token,
    tokens,
    brokerId,
    brokerName,
    chains,
    currentChain,
    maxAmount,
    onChainChange,
  } = props;
  return (
    <Box id="oui-deposit-form" className={textVariants({ weight: "semibold" })}>
      <Web3Wallet name={walletName} address={address} />

      <Box my={3}>
        <NetworkSelect chains={chains} currentChain={currentChain!} />
        <TokenInput
          tokens={tokens.map((item) => item.symbol)}
          classNames={{
            root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
          }}
        />
      </Box>

      <AvailableQuantity maxAmount={maxAmount} />

      <ExchangeDivider />

      <BrokerWallet name={brokerName} icon={<WalletIcon name={walletName} />} />

      <TokenInput
        tokens={tokens.map((item) => item.symbol)}
        classNames={{ root: "oui-mt-3" }}
      />

      <Flex direction="column" mt={1} gapY={1} itemAlign="start">
        <CoinExchange />
        <Fee />
      </Flex>

      <Flex justify="center" mt={8}>
        <Box width={184}>
          <AuthGuard>
            <Button fullWidth>Deposit</Button>
          </AuthGuard>
        </Box>
      </Flex>
    </Box>
  );
};
