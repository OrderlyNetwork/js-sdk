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
import { QuantityInput } from "../quantityInput";
import { ChainSelect } from "../chainSelect";
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
    brokerName,
    chains,
    currentChain,
    maxAmount,
    onChainChange,
    quantity,
    onQuantityChange,
    inputStatus,
    hintMessage,
    disabled,
    onTokenChange,
    onDeposit,
    onApprove,
    dst,
  } = props;
  return (
    <Box id="oui-deposit-form" className={textVariants({ weight: "semibold" })}>
      <Web3Wallet name={walletName} address={address} />

      <Box mt={3} mb={1}>
        <ChainSelect
          chains={chains}
          value={currentChain!}
          onValueChange={onChainChange}
        />
        <QuantityInput
          classNames={{
            root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
          }}
          value={quantity}
          tokens={tokens}
          onValueChange={onQuantityChange}
          status={inputStatus}
          hintMessage={hintMessage}
          onTokenChange={onTokenChange}
          precision={dst?.decimals}
        />
      </Box>

      <AvailableQuantity
        maxAmount={maxAmount}
        onClick={() => {
          onQuantityChange(maxAmount);
        }}
      />

      <ExchangeDivider />

      <BrokerWallet name={brokerName} />

      <QuantityInput
        tokens={tokens}
        classNames={{ root: "oui-mt-3" }}
        precision={dst?.decimals}
      />

      <Flex direction="column" mt={1} gapY={1} itemAlign="start">
        <CoinExchange />
        <Fee />
      </Flex>

      <Flex justify="center" mt={8}>
        <Box width={184}>
          <AuthGuard>
            <Button fullWidth disabled={disabled} onClick={onDeposit}>
              Deposit
            </Button>
          </AuthGuard>
        </Box>
      </Flex>
    </Box>
  );
};
