import React from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, textVariants } from "@orderly.network/ui";
import { LtvWidget } from "../LTV";
import { AvailableQuantity } from "../availableQuantity";
import { ExchangeDivider } from "../exchangeDivider";
import { Fee } from "../fee";
import { MinimumReceivedWidget } from "../minimumReceived";
import { QuantityInput } from "../quantityInput";
import { SlippageUI } from "../slippage/slippage.ui";
import { SwapCoin } from "../swapCoin";
import { WithdrawAction } from "../withdrawAction";
import type { ConvertFormScriptReturn } from "./convertForm.script";

export type ConvertFormProps = ConvertFormScriptReturn;

export const ConvertFormUI: React.FC<ConvertFormProps> = (props) => {
  const {
    address,
    loading,
    disabled,
    quantity,
    onQuantityChange,
    token,
    amount,
    maxQuantity,
    currentChain,
    fee,
    checkIsBridgeless,
    withdrawTo,
    sourceTokens,
    onSourceTokenChange,
    vaultBalanceList,
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
            vaultBalanceList={vaultBalanceList}
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
        <QuantityInput token={token} value={props.showQty} readOnly />
        <Flex direction="column" itemAlign="start" mt={2} gap={1}>
          <SwapCoin indexPrice={1} sourceSymbol={""} targetSymbol={""} />
          <SlippageUI slippage={"1"} />
          <MinimumReceivedWidget minimumReceived={2} symbol={""} />
          <LtvWidget showDiff={true} currentLtv={20} nextLTV={50} />
          <Fee {...fee} />
        </Flex>
      </Box>
      <Flex justify="center">
        <WithdrawAction
          checkIsBridgeless={checkIsBridgeless}
          networkId={props.networkId}
          disabled={disabled}
          loading={loading}
          onWithdraw={props.onWithdraw}
          crossChainWithdraw={props.crossChainWithdraw}
          currentChain={currentChain}
          address={address}
          quantity={quantity}
          fee={fee}
          withdrawTo={withdrawTo}
          onTransfer={props.onTransfer}
        />
      </Flex>
    </Box>
  );
};
