import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, textVariants, Text } from "@orderly.network/ui";
import { LtvWidget } from "../LTV";
import { ActionButton } from "../actionButton";
import { AvailableQuantity } from "../availableQuantity";
import { BrokerWallet } from "../brokerWallet";
import { ChainSelect } from "../chainSelect";
import { CollateralContributionWidget } from "../collateralContribution";
import { CollateralRatioWidget } from "../collateralRatio";
import { ExchangeDivider } from "../exchangeDivider";
import { Fee } from "../fee";
import { MinimumReceived } from "../minimumReceived";
import { QuantityInput } from "../quantityInput";
import { Slippage } from "../slippage";
import { Notice } from "../swap/components/notice";
import { SwapFee } from "../swap/components/swapFee";
import { SwapCoin } from "../swapCoin";
import { SwapIndicator } from "../swapIndicator";
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
    quantity,
    collateralContributionQuantity,
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
    slippage,
    onSlippageChange,
    minimumReceived,
    needSwap,
    needCrossSwap,
    swapPrice,
    swapQuantity,
    swapFee,
    warningMessage,
    swapRevalidating,
    usdcToken,
  } = props;

  const { t } = useTranslation();

  const renderContent = () => {
    if (needSwap || needCrossSwap) {
      return (
        <Flex direction="column" itemAlign="start" mt={1} gapY={1}>
          <Flex width={"100%"} itemAlign="center" justify="between">
            <Text size="2xs" intensity={36}>
              {t("transfer.deposit.convertRate")}
            </Text>
            <SwapCoin
              sourceSymbol={sourceToken?.display_name || sourceToken?.symbol}
              targetSymbol={targetToken?.display_name || targetToken?.symbol}
              indexPrice={swapPrice}
            />
          </Flex>
          {(needSwap || needCrossSwap) && (
            <Slippage value={slippage} onValueChange={onSlippageChange} />
          )}
          <MinimumReceived
            value={minimumReceived}
            symbol={targetToken?.symbol ?? ""}
          />
          <SwapFee {...swapFee} />
        </Flex>
      );
    }

    if (sourceToken?.symbol === "USDC") {
      return (
        <Flex mt={2} direction="column" itemAlign="start">
          <SwapCoin
            indexPrice={1}
            precision={0}
            sourceSymbol={sourceToken?.display_name || sourceToken?.symbol}
            targetSymbol={targetToken?.display_name || targetToken?.symbol}
          />
          <Fee {...fee} />
        </Flex>
      );
    }

    if (sourceToken?.is_collateral && targetToken?.symbol !== "USDC") {
      return (
        <Flex direction="column" itemAlign="start" mt={2} gap={1}>
          <CollateralRatioWidget value={collateralRatio} />
          <CollateralContributionWidget
            // it need to use USDC precision
            precision={usdcToken?.precision ?? 6}
            value={collateralContributionQuantity}
          />
          <LtvWidget
            showDiff={typeof quantity !== "undefined" && Number(quantity) > 0}
            currentLtv={currentLTV}
            nextLTV={nextLTV}
          />
          <Fee {...fee} />
        </Flex>
      );
    }
  };

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
          value={needSwap ? swapQuantity : quantity}
          loading={swapRevalidating}
          classNames={{
            root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
          }}
        />
        {renderContent()}
      </Box>

      <SwapIndicator
        sourceToken={sourceToken?.symbol}
        targetToken={targetToken?.symbol}
        className="oui-mb-3"
      />

      <Notice
        message={warningMessage}
        needSwap={needSwap}
        needCrossSwap={needCrossSwap}
        wrongNetwork={wrongNetwork}
        networkId={networkId}
      />

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
