import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, textVariants } from "@orderly.network/ui";
import { LtvWidget } from "../LTV";
import { AvailableQuantity } from "../availableQuantity";
import { ConvertAction } from "../convertAction";
import { ExchangeDivider } from "../exchangeDivider";
import { MinimumReceived } from "../minimumReceived";
import { QuantityInput } from "../quantityInput";
import { Slippage } from "../slippage";
import { SwapCoin } from "../swapCoin";
import type { ConvertFormScriptReturn } from "./convertForm.script";
import { unnormalizeAmount } from "./quoteAmount";

export type ConvertFormProps = ConvertFormScriptReturn;

const QuoteDetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <Flex width="100%" itemAlign="center" justify="between">
    <Text size="2xs" intensity={36}>
      {label}
    </Text>
    <Text size="2xs" intensity={80}>
      {value}
    </Text>
  </Flex>
);

export const ConvertFormUI: React.FC<ConvertFormProps> = (props) => {
  const { t } = useTranslation();
  const {
    loading,
    disabled,
    quantity,
    onQuantityChange,
    maxQuantity,
    token,
    targetToken,
    sourceTokens,
    onSourceTokenChange,
    onConvert,
    slippage,
    onSlippageChange,
    convertRate,
    outAmounts,
    minimumReceived,
    isQuoteLoading,
    currentLTV,
    nextLTV,
    networkId,
    balanceRevalidating,
    quoteDetails,
  } = props;

  return (
    <Box className={textVariants({ weight: "semibold" })}>
      <Box className="oui-mb-6 lg:oui-mb-8">
        <Box mt={3} mb={1}>
          <QuantityInput
            value={quantity}
            onValueChange={onQuantityChange}
            token={token}
            tokens={sourceTokens}
            onTokenChange={onSourceTokenChange}
          />
        </Box>
        <AvailableQuantity
          token={token}
          quantity={quantity}
          maxQuantity={maxQuantity.toString()}
          loading={balanceRevalidating}
          onClick={() => {
            onQuantityChange(maxQuantity.toString());
          }}
        />
        <ExchangeDivider />
        <QuantityInput
          readOnly
          loading={isQuoteLoading}
          token={targetToken}
          value={
            isQuoteLoading || !quantity || Number.isNaN(Number(outAmounts))
              ? ""
              : unnormalizeAmount(outAmounts, targetToken?.decimals ?? 6)
          }
        />
        <Flex direction="column" itemAlign="start" mt={2} gap={1}>
          <SwapCoin
            indexPrice={
              isQuoteLoading || !quantity || Number.isNaN(Number(convertRate))
                ? "-"
                : convertRate
            }
            sourceSymbol={token?.token}
            targetSymbol={targetToken?.token}
          />
          <Slippage value={slippage} onValueChange={onSlippageChange} />
          <MinimumReceived
            symbol={targetToken?.token || ""}
            precision={targetToken?.precision ?? 6}
            value={
              isQuoteLoading ||
              !quantity ||
              Number.isNaN(Number(minimumReceived))
                ? "-"
                : unnormalizeAmount(
                    minimumReceived.toString(),
                    targetToken?.decimals ?? 6,
                  )
            }
          />
          {quoteDetails && (
            <Flex width="100%" direction="column" gap={1}>
              <QuoteDetailRow
                label={t("transfer.convert.priceImpact")}
                value={
                  quoteDetails.priceImpactPercent === null
                    ? t("transfer.convert.unavailable")
                    : `${quoteDetails.priceImpactPercent}%`
                }
              />
              {quoteDetails.estimatedGasFeeValue !== null && (
                <QuoteDetailRow
                  label={t("transfer.convert.gasFee")}
                  value={quoteDetails.estimatedGasFeeValue}
                />
              )}
              <QuoteDetailRow
                label={t("transfer.convert.quoteExpires")}
                value={new Date(quoteDetails.expiresAt).toLocaleTimeString()}
              />
            </Flex>
          )}
          <LtvWidget
            showDiff={typeof quantity !== "undefined" && Number(quantity) > 0}
            currentLtv={currentLTV}
            nextLTV={nextLTV}
          />
        </Flex>
      </Box>
      <Flex itemAlign={"center"} justify="center">
        <ConvertAction
          networkId={networkId}
          disabled={disabled}
          loading={loading}
          onConvert={onConvert}
        />
      </Flex>
    </Box>
  );
};
