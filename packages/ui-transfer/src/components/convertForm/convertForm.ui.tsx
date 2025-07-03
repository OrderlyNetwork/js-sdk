import React from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, textVariants } from "@orderly.network/ui";
import { LtvWidget } from "../LTV";
import { AvailableQuantity } from "../availableQuantity";
import { ConvertAction } from "../convertAction";
import { ExchangeDivider } from "../exchangeDivider";
import { Fee } from "../fee";
import { MinimumReceivedWidget } from "../minimumReceived";
import { QuantityInput } from "../quantityInput";
import { SlippageUI } from "../slippage/slippage.ui";
import { SwapCoin } from "../swapCoin";
import type { ConvertFormScriptReturn } from "./convertForm.script";

export type ConvertFormProps = ConvertFormScriptReturn;

export const ConvertFormUI: React.FC<ConvertFormProps> = (props) => {
  const {
    loading,
    disabled,
    quantity,
    onQuantityChange,
    amount,
    maxQuantity,
    fee,
    token,
    targetToken,
    sourceTokens,
    onSourceTokenChange,
    onConvert,
    slippage,
    setSlippage,
    convertRate,
  } = props;

  // const { t } = useTranslation();

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
          amount={amount}
          maxQuantity={maxQuantity.toString()}
          loading={props.balanceRevalidating}
          onClick={() => {
            onQuantityChange(maxQuantity.toString());
          }}
        />
        <ExchangeDivider />
        <QuantityInput token={targetToken} value={props.showQty} readOnly />
        <Flex direction="column" itemAlign="start" mt={2} gap={1}>
          <SwapCoin
            indexPrice={convertRate}
            sourceSymbol={token?.display_name || token?.symbol}
            targetSymbol={targetToken?.display_name || targetToken?.symbol}
          />
          <SlippageUI slippage={slippage} setSlippage={setSlippage} />
          <MinimumReceivedWidget
            minimumReceived={2}
            symbol={targetToken?.display_name || targetToken?.symbol || ""}
          />
          <LtvWidget showDiff={true} currentLtv={20} nextLTV={50} />
          <Fee {...fee} />
        </Flex>
      </Box>
      <Flex itemAlign={"center"} justify="center">
        <ConvertAction
          networkId={props.networkId}
          disabled={disabled}
          loading={loading}
          onConvert={onConvert}
          // address={address}
          // quantity={quantity}
          // fee={fee}
          // withdrawTo={withdrawTo}
        />
      </Flex>
    </Box>
  );
};
