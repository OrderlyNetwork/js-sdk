import { FC } from "react";
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

export const DepositForm: FC<UseDepositFormScriptReturn> = (props) => {
  const {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,
    amount,
    sourceQuantity,
    targetQuantity,
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
    wrongNetwork,
    balanceRevalidating,
    loading,
    disabled,
    networkId,
    fee,
    collateralRatio,
    currentLTV,
    nextLTV,
    indexPrice,
    slippage,
    setSlippage,
    minimumReceived,
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
            value={sourceQuantity}
            onValueChange={onQuantityChange}
            token={sourceToken}
            tokens={sourceTokens}
            onTokenChange={onSourceTokenChange}
            status={inputStatus}
            hintMessage={hintMessage}
            fetchBalance={fetchBalance}
            data-testId="oui-testid-deposit-dialog-quantity-input"
          />
        </Box>

        <AvailableQuantity
          token={sourceToken}
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
          token={targetToken}
          tokens={targetTokens}
          onTokenChange={onTargetTokenChange}
          value={targetQuantity}
          classNames={{
            root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
          }}
        />
        {sourceToken?.symbol === targetToken?.symbol ? (
          <Flex direction="column" itemAlign="start" mt={1} gapY={1}>
            <CollateralRatioWidget collateralRatio={collateralRatio} />
            <CollateralContributionWidget
              collateralContribution={targetQuantity}
              token={targetToken?.symbol ?? ""}
            />
            <LtvWidget
              showDiff={
                typeof sourceQuantity !== "undefined" &&
                Number(sourceQuantity) > 0
              }
              currentLtv={currentLTV}
              nextLTV={nextLTV}
            />
            <Fee {...fee} />
          </Flex>
        ) : (
          <Flex direction="column" itemAlign="start" mt={1} gapY={1}>
            <SwapCoin
              sourceToken={sourceToken}
              targetToken={targetToken}
              indexPrice={indexPrice}
            />
            <SlippageUI slippage={slippage} setSlippage={setSlippage} />
            <MinimumReceivedWidget
              minimumReceived={minimumReceived}
              symbol={targetToken?.symbol ?? ""}
            />
            <Fee {...fee} />
            <AssetSwapIndicatorWidget
              sourceToken={sourceToken?.symbol ?? ""}
              targetToken={targetToken?.symbol ?? ""}
            />
          </Flex>
        )}
      </Box>
      <Flex justify="center">
        <ActionButton
          actionType={actionType}
          symbol={sourceToken?.symbol}
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
