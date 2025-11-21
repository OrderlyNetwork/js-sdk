import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, textVariants, Text } from "@orderly.network/ui";
import { LtvWidget } from "../LTV";
import { ActionButton } from "../actionButton";
import { AvailableQuantity } from "../availableQuantity";
import { BrokerWallet } from "../brokerWallet";
import { ChainSelect } from "../chainSelect";
import { CollateralContribution } from "../collateralContribution";
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
import { YieldBearingReminder } from "../yieldBearingReminder";
import {
  SWAP_USDC_PRECISION,
  type DepositFormScriptReturn,
} from "./depositForm.script";

export const DepositForm: FC<DepositFormScriptReturn> = (props) => {
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
    onApproveAndDeposit,
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
    swapFee,
    warningMessage,
    usdcToken,
    targetQuantity,
    targetQuantityLoading,
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
              precision={SWAP_USDC_PRECISION}
              indexPrice={swapPrice}
            />
          </Flex>
          <Slippage value={slippage} onValueChange={onSlippageChange} />
          <MinimumReceived
            value={minimumReceived}
            symbol={targetToken?.symbol ?? ""}
            precision={SWAP_USDC_PRECISION}
          />
          <SwapFee {...swapFee} />
        </Flex>
      );
    }

    return (
      <Flex direction="column" itemAlign="start" mt={2} gap={1}>
        <CollateralRatioWidget value={collateralRatio} />
        <CollateralContribution
          // it need to use USDC precision
          precision={usdcToken?.precision ?? 6}
          value={collateralContributionQuantity}
        />
        <LtvWidget
          showDiff={typeof quantity !== "undefined" && Number(quantity) > 0}
          currentLtv={currentLTV}
          nextLTV={nextLTV}
        />
        <Fee {...fee} nativeSymbol={props.nativeSymbol} />
      </Flex>
    );
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
            disabled={!props.isLoggedIn}
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
            tokenBalances={props.tokenBalances}
            data-testId="oui-testid-deposit-dialog-quantity-input"
            disabled={!props.isLoggedIn}
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

        {/* Yield-bearing collateral reminder */}
        <YieldBearingReminder
          symbol={targetToken?.symbol}
          className="oui-mt-3"
        />

        <ExchangeDivider />

        <BrokerWallet />

        <QuantityInput
          readOnly
          token={targetToken}
          tokens={targetTokens}
          onTokenChange={onTargetTokenChange}
          value={targetQuantity}
          loading={targetQuantityLoading}
          classNames={{
            root: "oui-mt-3 oui-border-transparent focus-within:oui-outline-transparent",
          }}
          disabled={!props.isLoggedIn}
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
          onApproveAndDeposit={onApproveAndDeposit}
          networkId={networkId}
        />
      </Flex>
    </Box>
  );
};
