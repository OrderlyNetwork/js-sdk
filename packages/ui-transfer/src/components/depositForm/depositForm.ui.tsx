import { FC } from "react";
import type { API } from "@orderly.network/types";
import { Box, Flex, textVariants } from "@orderly.network/ui";
import { LtvWidget } from "../LTV";
import { ActionButton } from "../actionButton";
import { AssetSwapIndicatorWidget } from "../assetSwapIndicator";
import { AvailableQuantity } from "../availableQuantity";
import { BrokerWallet } from "../brokerWallet";
import { ChainSelect } from "../chainSelect";
import { CollateralContributionWidget } from "../collateralContribution";
import { CollateralRatioWidget } from "../collateralRatio";
import { ExchangeDivider } from "../exchangeDivider";
import { Fee } from "../fee";
import { MinimumReceivedWidget } from "../minimumReceived";
import { QuantityInput } from "../quantityInput";
import { SlippageUI } from "../slippage/slippage.ui";
import { SwapCoin } from "../swapCoin";
import { Web3Wallet } from "../web3Wallet";
import type { UseDepositFormScriptReturn } from "./depositForm.script";

const flag = true;

export const DepositForm: FC<UseDepositFormScriptReturn> = (props) => {
  const {
    fromToken,
    toToken,
    onFromTokenChange,
    onToTokenChange,
    tokensList,
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

  const mockTokensList = [
    ...tokensList,
    {
      symbol: "BTC",
      address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      decimals: 6,
      display_name: "BTC",
    } as API.TokenInfo,
  ];

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
            tokens={mockTokensList}
            token={fromToken}
            onTokenChange={onFromTokenChange}
            status={inputStatus}
            hintMessage={hintMessage}
            fetchBalance={fetchBalance}
            data-testId="oui-testid-deposit-dialog-quantity-input"
          />
        </Box>

        <AvailableQuantity
          token={fromToken}
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
          token={toToken}
          tokens={mockTokensList}
          onTokenChange={onToTokenChange}
          value={quantity}
          classNames={{
            root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
          }}
        />
        {flag ? (
          <Flex direction="column" itemAlign="start" mt={1} gapY={1}>
            <CollateralRatioWidget />
            <CollateralContributionWidget />
            <LtvWidget />
            <Fee {...fee} />
          </Flex>
        ) : (
          <Flex direction="column" itemAlign="start" mt={1} gapY={1}>
            <SwapCoin token={fromToken} dst={dst} price={1} />
            <SlippageUI slippage="1" />
            <MinimumReceivedWidget />
            <Fee {...fee} />
            <AssetSwapIndicatorWidget />
          </Flex>
        )}
      </Box>
      <Flex justify="center">
        <ActionButton
          actionType={actionType}
          symbol={fromToken?.symbol}
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
