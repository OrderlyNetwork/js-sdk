import React from "react";
import { Box, Flex, textVariants } from "@orderly.network/ui";
import { LtvWidget } from "../LTV";
import { AvailableQuantity } from "../availableQuantity";
import { ConvertAction } from "../convertAction";
import { ExchangeDivider } from "../exchangeDivider";
import { Fee } from "../fee";
import { MinimumReceived } from "../minimumReceived";
import { QuantityInput } from "../quantityInput";
import { Slippage } from "../slippage";
import { SwapCoin } from "../swapCoin";
import {
  unnormalizeAmount,
  type ConvertFormScriptReturn,
} from "./convertForm.script";

export type ConvertFormProps = ConvertFormScriptReturn;

export const ConvertFormUI: React.FC<ConvertFormProps> = (props) => {
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
    minimumReceived,
    isQuoteLoading,
    currentLTV,
    nextLTV,
  } = props;

  const minimumReceivedValue =
    isQuoteLoading || !quantity
      ? "-"
      : unnormalizeAmount(
          minimumReceived.toString(),
          targetToken?.decimals ?? 6,
        );

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
            status={props.inputStatus}
            hintMessage={props.hintMessage}
          />
        </Box>
        <AvailableQuantity
          token={token}
          amount={quantity}
          maxQuantity={maxQuantity.toString()}
          loading={props.balanceRevalidating}
          onClick={() => {
            onQuantityChange(maxQuantity.toString());
          }}
        />
        <ExchangeDivider />
        <QuantityInput
          readOnly
          loading={isQuoteLoading}
          token={targetToken}
          value={minimumReceivedValue}
        />
        <Flex direction="column" itemAlign="start" mt={2} gap={1}>
          <SwapCoin
            indexPrice={isQuoteLoading || !quantity ? "-" : convertRate}
            sourceSymbol={token?.display_name || token?.symbol}
            targetSymbol={targetToken?.display_name || targetToken?.symbol}
          />
          <Slippage value={slippage} onValueChange={onSlippageChange} />
          <MinimumReceived
            symbol={targetToken?.display_name || targetToken?.symbol || ""}
            value={minimumReceivedValue}
          />
          <LtvWidget
            showDiff={typeof quantity !== "undefined" && Number(quantity) > 0}
            currentLtv={currentLTV}
            nextLTV={nextLTV}
          />
          <Fee dstGasFee={"0"} />
        </Flex>
      </Box>
      <Flex itemAlign={"center"} justify="center">
        <ConvertAction
          networkId={props.networkId}
          disabled={disabled}
          loading={loading}
          onConvert={onConvert}
        />
      </Flex>
    </Box>
  );
};
