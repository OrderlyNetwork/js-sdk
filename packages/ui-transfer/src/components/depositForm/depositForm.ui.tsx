import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, textVariants, Text } from "@orderly.network/ui";
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
import { Notice } from "../swap/components/notice";
import { Slippage } from "../swap/components/slippage";
import { SwapFee } from "../swap/components/swapFee";
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
    needSwap,
    needCrossSwap,
    swapPrice,
    markPrice,
    swapQuantity,
    swapFee,
    warningMessage,
    swapRevalidating,
    swapSlippage,
    onSwapSlippageChange,
  } = props;

  const { t } = useTranslation();

  const renderContent = () => {
    if (needSwap || needCrossSwap) {
      return (
        <Flex direction="column" itemAlign="start" mt={1} gapY={1}>
          <Flex justify="between" width="100%">
            <SwapCoin
              sourceSymbol={sourceToken?.display_name || sourceToken?.symbol}
              targetSymbol={targetToken?.display_name || targetToken?.symbol}
              indexPrice={swapPrice}
            />
            {(needSwap || needCrossSwap) && (
              // swap slippage max value is not the same as deposit slippage max value
              <Slippage
                value={swapSlippage}
                onValueChange={onSwapSlippageChange}
              />
            )}
          </Flex>
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

    if (sourceToken?.is_collateral) {
      if (targetToken?.symbol === "USDC") {
        return (
          <Flex direction="column" itemAlign="start" mt={2} gapY={1}>
            <Flex width={"100%"} itemAlign="center" justify="between">
              <Text size="2xs" intensity={36}>
                {t("transfer.deposit.convertRate")}
              </Text>
              <SwapCoin
                indexPrice={indexPrice}
                sourceSymbol={sourceToken?.display_name || sourceToken?.symbol}
                targetSymbol={targetToken?.display_name || targetToken?.symbol}
              />
            </Flex>
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
        );
      }
      return (
        <Flex direction="column" itemAlign="start" mt={2} gap={1}>
          <CollateralRatioWidget value={collateralRatio} />
          <CollateralContributionWidget
            precision={targetToken?.precision ?? 6}
            value={targetQuantity}
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
          value={needSwap ? swapQuantity : targetQuantity}
          loading={swapRevalidating}
          classNames={{
            root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
          }}
        />
        {renderContent()}
      </Box>

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
