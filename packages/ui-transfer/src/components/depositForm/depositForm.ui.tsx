import { FC } from "react";
import { UseDepositFormScriptReturn } from "./depositForm.script";
import { Box, Flex, textVariants, Button } from "@orderly.network/ui";
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
    amount,
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
    price,
    fee,
    nativeToken,
    loading,
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
          token={token}
          tokens={tokens}
          onValueChange={onQuantityChange}
          status={inputStatus}
          hintMessage={hintMessage}
          onTokenChange={onTokenChange}
          precision={dst?.decimals}
        />
      </Box>

      <AvailableQuantity
        token={token}
        amount={amount}
        maxAmount={maxAmount}
        onClick={() => {
          onQuantityChange(maxAmount);
        }}
      />

      <ExchangeDivider />

      <BrokerWallet name={brokerName} />

      <QuantityInput
        tokens={tokens}
        value={quantity}
        classNames={{
          root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
        }}
        precision={dst?.decimals}
        readOnly
      />

      <Flex direction="column" mt={1} gapY={1} itemAlign="start">
        <CoinExchange token={token} dstSymbol={dst?.symbol} price={price} />
        <Fee fee={fee} nativeToken={nativeToken} />
      </Flex>

      <Flex justify="center" mt={8}>
        <Box width={184}>
          <AuthGuard>
            <Button
              fullWidth
              disabled={disabled}
              onClick={onDeposit}
              loading={loading}
            >
              Deposit
            </Button>
          </AuthGuard>
        </Box>
      </Flex>
    </Box>
  );
};
