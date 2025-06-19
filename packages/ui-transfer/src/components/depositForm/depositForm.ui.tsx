import { FC } from "react";
import type { API } from "@orderly.network/types";
import { Box, Flex, textVariants } from "@orderly.network/ui";
import { LtvWidget } from "../LTV";
import { ActionButton } from "../actionButton";
import { AvailableQuantity } from "../availableQuantity";
import { BrokerWallet } from "../brokerWallet";
import { ChainSelect } from "../chainSelect";
import { CollateralContributionWidget } from "../collateralContribution";
import { CollateralRatioWidget } from "../collateralRatio";
import { ExchangeDivider } from "../exchangeDivider";
import { Fee } from "../fee";
import { QuantityInput } from "../quantityInput";
import { SwapCoin } from "../swapCoin";
import { Web3Wallet } from "../web3Wallet";
import { UseDepositFormScriptReturn } from "./depositForm.script";

export const DepositForm: FC<UseDepositFormScriptReturn> = (props) => {
  const {
    token,
    tokens,
    onTokenChange,
    amount,
    quantity,
    maxQuantity,
    onQuantityChange,
    hintMessage,
    inputStatus,
    chains,
    currentChain,
    settingChain,
    onChainChange,
    actionType,
    onDeposit,
    onApprove,
    fetchBalance,
    dst,
    wrongNetwork,
    balanceRevalidating,
    loading,
    disabled,
    networkId,
    fee,
  } = props;

  return (
    <Box id="oui-deposit-form" className={textVariants({ weight: "semibold" })}>
      <Box className="oui-mb-6 lg:oui-mb-8">
        <Web3Wallet />
        <Box mt={3} mb={1}>
          <ChainSelect
            chains={chains}
            value={currentChain!}
            onValueChange={onChainChange}
            wrongNetwork={wrongNetwork}
            loading={settingChain}
          />
          <QuantityInput
            classNames={{
              root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
            }}
            value={quantity}
            onValueChange={onQuantityChange}
            tokens={tokens}
            token={token}
            onTokenChange={onTokenChange}
            status={inputStatus}
            hintMessage={hintMessage}
            fetchBalance={fetchBalance}
            data-testId="oui-testid-deposit-dialog-quantity-input"
          />
        </Box>

        <AvailableQuantity
          token={token}
          amount={amount}
          maxQuantity={maxQuantity}
          loading={balanceRevalidating}
          onClick={() => {
            onQuantityChange(maxQuantity);
          }}
        />

        <ExchangeDivider />

        <BrokerWallet />

        <QuantityInput
          readOnly
          token={dst as unknown as API.TokenInfo}
          value={quantity}
          classNames={{
            root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
          }}
        />

        <Flex direction="column" mt={1} gapY={1} itemAlign="start">
          <SwapCoin token={token} dst={dst} price={1} />
          <CollateralRatioWidget />
          <CollateralContributionWidget />
          <LtvWidget />
          <Fee {...fee} />
        </Flex>
      </Box>

      <Flex justify="center">
        <ActionButton
          actionType={actionType}
          symbol={token?.symbol}
          disabled={disabled}
          loading={loading}
          onDeposit={onDeposit}
          onApprove={onApprove}
          networkId={networkId}
        />
      </Flex>
    </Box>
  );
};
